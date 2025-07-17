import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
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
  AreaChart,
  Area,
} from 'recharts';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { SystemMetric } from '../types/oracleTypes';

const SystemMetrics: React.FC = () => {
  const { service, isConnected, filters, error } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!service || !isConnected) return;

      try {
        setLoading(true);
        const data = await service.getSystemMetrics(filters);
        setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch system metrics:', err);
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

  // Group metrics by type and prepare chart data
  const metricTypes = ['CPU Usage', 'Memory Usage', 'Disk I/O', 'Network I/O', 'Active Sessions'];
  
  const chartDataByType = metricTypes.reduce((acc, metricType) => {
    acc[metricType] = metrics
      .filter(m => m.metricName === metricType)
      .slice(0, 30) // Last 30 data points
      .map(m => {
        let dateObj: Date;
        if (m.timestamp instanceof Date) {
          dateObj = m.timestamp;
        } else {
          dateObj = new Date(m.timestamp);
        }
        return {
          time: dateObj.toLocaleTimeString(),
          value: m.value,
          unit: m.unit,
        };
      });
    return acc;
  }, {} as Record<string, any[]>);

  // Get latest values for summary cards
  const getLatestValue = (metricType: string) => {
    const latestMetric = metrics
      .filter(m => m.metricName === metricType)
      .sort((a, b) => {
        let aDate: Date = a.timestamp instanceof Date ? a.timestamp : new Date(a.timestamp);
        let bDate: Date = b.timestamp instanceof Date ? b.timestamp : new Date(b.timestamp);
        return bDate.getTime() - aDate.getTime();
      })[0];
    return latestMetric ? latestMetric.value : 0;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Metrics
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Real-time system and database performance metrics monitoring
      </Typography>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {metricTypes.map(metricType => {
          const latestValue = getLatestValue(metricType);
          const unit = metrics.find(m => m.metricName === metricType)?.unit || '';
          
          return (
            <Card key={metricType} sx={{ flex: '1 1 200px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {metricType}
                </Typography>
                <Typography variant="h5" component="div">
                  {latestValue.toFixed(1)}{unit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Value
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* CPU and Memory Usage */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            CPU and Memory Usage Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" type="category" allowDuplicatedCategory={false} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line 
                dataKey="value" 
                data={chartDataByType['CPU Usage']} 
                name="CPU Usage (%)" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
              <Line 
                dataKey="value" 
                data={chartDataByType['Memory Usage']} 
                name="Memory Usage (%)" 
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* I/O Metrics */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            I/O Performance Over Time
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" type="category" allowDuplicatedCategory={false} />
              <YAxis />
              <Tooltip />
              <Area 
                dataKey="value" 
                data={chartDataByType['Disk I/O']} 
                name="Disk I/O (MB/s)" 
                stackId="1"
                stroke="#8884d8" 
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Area 
                dataKey="value" 
                data={chartDataByType['Network I/O']} 
                name="Network I/O (MB/s)" 
                stackId="1"
                stroke="#82ca9d" 
                fill="#82ca9d"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Active Sessions */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Active Database Sessions
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataByType['Active Sessions']}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#ff7300" 
                strokeWidth={2}
                name="Active Sessions"
              />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default SystemMetrics;
