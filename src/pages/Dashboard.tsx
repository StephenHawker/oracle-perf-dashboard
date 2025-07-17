import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { PerformanceSummary, OrdsMetrics, SystemMetric } from '../types/oracleTypes';

const Dashboard: React.FC = () => {
  const { service, isConnected, filters, error: contextError, config } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const [ordsMetrics, setOrdsMetrics] = useState<OrdsMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const fetchWithTimeout = (promise: Promise<any>, ms: number) =>
      Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms))
      ]);

    const fetchData = async () => {
      if (!service || !isConnected) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        console.log('[Dashboard] Fetching summary...');
        const summaryPromise = fetchWithTimeout(service.getPerformanceSummary(filters), 5000);
        const ordsPromise = fetchWithTimeout(service.getOrdsMetrics(filters), 5000);
        const systemPromise = fetchWithTimeout(service.getSystemMetrics(filters), 5000);
        const [summaryData, ordsData, systemData] = await Promise.all([
          summaryPromise,
          ordsPromise,
          systemPromise,
        ]);
        console.log('[Dashboard] Summary:', summaryData);
        console.log('[Dashboard] ORDS:', ordsData);
        console.log('[Dashboard] System:', systemData);
        if (!cancelled) {
          setSummary({
            ...summaryData,
            topWaitEvents: summaryData.topWaitEvents ?? [],
            topSqlStatements: summaryData.topSqlStatements ?? [],
            recommendations: summaryData.recommendations ?? [],
            ordsMetrics: summaryData.ordsMetrics ?? {
              timestamp: new Date(),
              activeConnections: 0,
              queuedRequests: 0,
              averageResponseTime: 0,
              requestsPerSecond: 0,
              errorsPerSecond: 0,
              memoryUsage: 0,
              cpuUsage: 0,
            },
          });
          setOrdsMetrics(ordsData);
          setSystemMetrics(systemData);
        }
      } catch (err) {
        console.error('[Dashboard] Fetch error:', err);
        if (!cancelled) {
          setError((err instanceof Error && err.message) ? err.message : 'Failed to fetch dashboard data');
          setSummary(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // Debug output for troubleshooting
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Box mt={2}>
          <Paper elevation={2} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">Debug Info:</Typography>
            <Typography variant="caption" color="text.secondary">isConnected: {String(isConnected)}</Typography><br />
            <Typography variant="caption" color="text.secondary">service: {service ? 'OK' : 'null'}</Typography><br />
            <Typography variant="caption" color="text.secondary">config: {config ? JSON.stringify(config) : 'null'}</Typography><br />
            <Typography variant="caption" color="text.secondary">filters: {JSON.stringify(filters)}</Typography><br />
            <Typography variant="caption" color="text.secondary">error: {error || contextError || 'none'}</Typography>
          </Paper>
        </Box>
      </Box>
    );
  }

  // Show 'No data available' if summary is missing or all key metrics are zero/empty
  const noData = !summary || (
    (!summary.totalDbTime && !summary.totalCpuTime && !summary.averageActiveSessions && (!summary.topWaitEvents || summary.topWaitEvents.length === 0))
  );
  if (noData) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="400px">
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No data available for the selected date range.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting the date range or check your database seed data.
        </Typography>
      </Box>
    );
  }

  if (error || contextError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error || contextError}
      </Alert>
    );
  }

  const formatTime = (microseconds: number) => {
    const seconds = microseconds / 1000000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  const waitEventData = summary.topWaitEvents.map(event => ({
    name: event.eventName,
    time: event.timeWaited / 1000000, // Convert to seconds
    waits: event.totalWaits,
  }));

  const cpuMetrics = systemMetrics
    .filter(m => m.metricName === 'CPU Usage')
    .slice(0, 20)
    .map(m => ({
      time: (m.timestamp ? new Date(m.timestamp) : new Date()).toLocaleTimeString(),
      value: m.value,
    }));

  const ordsChartData = ordsMetrics.slice(0, 20).map(metric => ({
    time: (metric.timestamp ? new Date(metric.timestamp) : new Date()).toLocaleTimeString(),
    responseTime: metric.averageResponseTime,
    requestsPerSec: metric.requestsPerSecond,
    errors: metric.errorsPerSecond,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Oracle Performance Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Real-time monitoring of Oracle database performance metrics
      </Typography>

      {/* Key Performance Indicators */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total DB Time
            </Typography>
            <Typography variant="h5" component="div">
              {formatTime(summary.totalDbTime ?? 0)}
            </Typography>
            <Chip 
              label="Last 24h" 
              size="small" 
              color="primary" 
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              CPU Time
            </Typography>
            <Typography variant="h5" component="div">
              {formatTime(summary.totalCpuTime ?? 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(((summary.totalCpuTime ?? 0) / (summary.totalDbTime ?? 1)) * 100).toFixed(1)}% of DB Time
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg Active Sessions
            </Typography>
            <Typography variant="h5" component="div">
              {(summary.averageActiveSessions ?? 0).toFixed(1)}
            </Typography>
            <Chip 
              label="Current" 
              size="small" 
              color="success" 
              variant="outlined"
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 250px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              ORDS Response Time
            </Typography>
            <Typography variant="h5" component="div">
              {(summary.ordsMetrics?.averageResponseTime ?? 0).toFixed(1)}ms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {(summary.ordsMetrics?.requestsPerSecond ?? 0).toFixed(1)} req/sec
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* Wait Events Chart */}
        <Paper sx={{ p: 2, flex: '1 1 500px' }}>
          <Typography variant="h6" gutterBottom>
            Top Wait Events (Time Waited)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={waitEventData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="time"
              >
                {waitEventData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}s`, 'Time Waited']} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* System CPU Usage */}
        <Paper sx={{ p: 2, flex: '1 1 500px' }}>
          <Typography variant="h6" gutterBottom>
            CPU Usage Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cpuMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'CPU Usage']} />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* ORDS Metrics */}
        <Paper sx={{ p: 2, flex: '1 1 500px' }}>
          <Typography variant="h6" gutterBottom>
            ORDS Response Time & Throughput
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#8884d8" 
                name="Response Time (ms)"
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="requestsPerSec" 
                stroke="#82ca9d" 
                name="Requests/sec"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Top SQL Statements */}
        <Paper sx={{ p: 2, flex: '1 1 100%' }}>
          <Typography variant="h6" gutterBottom>
            Top SQL Statements by Elapsed Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.topSqlStatements}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sqlId" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${formatTime(value)}`, 'Elapsed Time']}
                labelFormatter={(label) => `SQL ID: ${label}`}
              />
              <Bar dataKey="elapsedTime" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Recommendations */}
        <Paper sx={{ p: 2, flex: '1 1 100%' }}>
          <Typography variant="h6" gutterBottom>
            Performance Recommendations
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {summary.recommendations.map((recommendation) => (
              <Alert key={recommendation} severity="info" variant="outlined">
                {recommendation}
              </Alert>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
