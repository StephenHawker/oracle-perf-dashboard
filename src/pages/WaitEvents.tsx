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
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { WaitEvent } from '../types/oracleTypes';

const WaitEvents: React.FC = () => {
  const { service, isConnected, filters, error } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [waitEvents, setWaitEvents] = useState<WaitEvent[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!service || !isConnected) return;

      try {
        setLoading(true);
        const data = await service.getTopWaitEvents(filters);
        setWaitEvents(data);
      } catch (err) {
        console.error('Failed to fetch wait events data:', err);
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const pieData = waitEvents.map(event => ({
    name: event.eventName,
    value: event.timeWaited / 1000000, // Convert to seconds
  }));

  const barData = waitEvents.map(event => ({
    name: event.eventName.length > 20 ? event.eventName.substring(0, 17) + '...' : event.eventName,
    waits: event.totalWaits,
    avgWait: event.averageWait,
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Wait Events Analysis
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Analysis of database wait events and their impact on performance
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        {/* Time Waited Pie Chart */}
        <Paper sx={{ p: 2, flex: '1 1 500px' }}>
          <Typography variant="h6" gutterBottom>
            Time Waited Distribution
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value.toFixed(1)}s`, 'Time Waited']} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Wait Count Bar Chart */}
        <Paper sx={{ p: 2, flex: '1 1 500px' }}>
          <Typography variant="h6" gutterBottom>
            Total Waits by Event
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="waits" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Detailed Wait Events Table */}
      <Paper sx={{ mt: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Wait Events Details
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>Wait Class</TableCell>
                <TableCell>Total Waits</TableCell>
                <TableCell>Total Timeouts</TableCell>
                <TableCell>Time Waited (s)</TableCell>
                <TableCell>Average Wait (ms)</TableCell>
                <TableCell>Waits/Sec</TableCell>
                <TableCell>Time Waited/Sec</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {waitEvents.map((event) => (
                <TableRow key={event.eventName}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{event.eventName}</TableCell>
                  <TableCell>{event.waitClass}</TableCell>
                  <TableCell>{event.totalWaits.toLocaleString()}</TableCell>
                  <TableCell>{event.totalTimeouts.toLocaleString()}</TableCell>
                  <TableCell>{(event.timeWaited / 1000000).toFixed(2)}</TableCell>
                  <TableCell>{event.averageWait.toFixed(2)}</TableCell>
                  <TableCell>{event.waitsPerSecond.toFixed(2)}</TableCell>
                  <TableCell>{event.timeWaitedPerSecond.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default WaitEvents;
