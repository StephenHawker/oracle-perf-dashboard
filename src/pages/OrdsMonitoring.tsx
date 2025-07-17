import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { OrdsApiCall, OrdsMetrics } from '../types/oracleTypes';

const OrdsMonitoring: React.FC = () => {
  const { service, isConnected, filters, error } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [apiCalls, setApiCalls] = useState<OrdsApiCall[]>([]);
  const [metrics, setMetrics] = useState<OrdsMetrics[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!service || !isConnected) return;

      try {
        setLoading(true);
        const [callsData, metricsData] = await Promise.all([
          service.getOrdsApiCalls(filters),
          service.getOrdsMetrics(filters),
        ]);
        setApiCalls(callsData);
        setMetrics(metricsData);
      } catch (err) {
        console.error('Failed to fetch ORDS data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [service, isConnected, filters]);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const responseTimeData = metrics.slice(0, 20).map(metric => {
    let dateObj: Date;
    if (metric.timestamp instanceof Date) {
      dateObj = metric.timestamp;
    } else {
      dateObj = new Date(metric.timestamp);
    }
    return {
      time: dateObj.toLocaleTimeString(),
      responseTime: metric.averageResponseTime,
      requestsPerSec: metric.requestsPerSecond,
      errors: metric.errorsPerSecond,
    };
  });

  const statusCodeData = apiCalls.reduce((acc, call) => {
    const status = call.statusCode.toString();
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.entries(statusCodeData).map(([status, count]) => ({
    status,
    count,
  }));

  const errorCalls = apiCalls.filter(call => call.statusCode >= 400);
  const avgResponseTime = apiCalls.reduce((sum, call) => sum + call.responseTime, 0) / apiCalls.length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ORDS (Oracle REST Data Services) Monitoring
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Real-time monitoring of REST API calls, performance metrics, and error tracking
      </Typography>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Total API Calls
            </Typography>
            <Typography variant="h5" component="div">
              {apiCalls.length}
            </Typography>
          </CardContent>
        </Card>
        
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Avg Response Time
            </Typography>
            <Typography variant="h5" component="div">
              {avgResponseTime.toFixed(1)}ms
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Error Rate
            </Typography>
            <Typography variant="h5" component="div">
              {((errorCalls.length / apiCalls.length) * 100).toFixed(1)}%
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Active Connections
            </Typography>
            <Typography variant="h5" component="div">
              {metrics.length > 0 ? metrics[0].activeConnections : 0}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {/* Response Time Chart */}
        <Paper sx={{ p: 2, flex: '1 1 500px' }}>
          <Typography variant="h6" gutterBottom>
            Response Time Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={responseTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="responseTime" stroke="#8884d8" name="Response Time (ms)" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Status Code Distribution */}
        <Paper sx={{ p: 2, flex: '1 1 400px' }}>
          <Typography variant="h6" gutterBottom>
            HTTP Status Code Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Recent API Calls */}
      <Paper sx={{ mt: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent API Calls
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>URI</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Response Time</TableCell>
                <TableCell>Request Size</TableCell>
                <TableCell>Response Size</TableCell>
                <TableCell>SQL ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apiCalls.slice(0, 20).map((call) => (
                <TableRow key={call.id}>
                  <TableCell>{call.timestamp.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={call.method} 
                      size="small" 
                      color={
                        call.method === 'GET' ? 'primary' :
                        call.method === 'POST' ? 'success' :
                        call.method === 'PUT' ? 'warning' :
                        call.method === 'DELETE' ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {call.uri}
                  </TableCell>
                  <TableCell>{call.remoteUser}</TableCell>
                  <TableCell>
                    <Chip 
                      label={call.statusCode} 
                      size="small" 
                      color={
                        call.statusCode < 300 ? 'success' :
                        call.statusCode < 400 ? 'warning' : 'error'
                      }
                    />
                  </TableCell>
                  <TableCell>{call.responseTime.toFixed(1)}ms</TableCell>
                  <TableCell>{(call.requestSize / 1024).toFixed(1)}KB</TableCell>
                  <TableCell>{(call.responseSize / 1024).toFixed(1)}KB</TableCell>
                  <TableCell>
                    {call.sqlId && (
                      <Chip label={call.sqlId} size="small" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default OrdsMonitoring;
