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
} from '@mui/material';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { AshData } from '../types/oracleTypes';

const AshAnalysis: React.FC = () => {
  const { service, isConnected, filters, error } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [ashData, setAshData] = useState<AshData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!service || !isConnected) return;

      try {
        setLoading(true);
        const data = await service.getAshData(filters);
        setAshData(data.slice(0, 50)); // Limit to 50 rows for display
      } catch (err) {
        console.error('Failed to fetch ASH data:', err);
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        ASH (Active Session History) Analysis
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Detailed analysis of active database sessions and their resource consumption
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Session ID</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>SQL ID</TableCell>
                <TableCell>Wait Class</TableCell>
                <TableCell>Wait Event</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Session State</TableCell>
                <TableCell>Sample Time</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ashData.map((row, idx) => {
                // Fallback to index if sampleTime is missing or not unique
                const key = row.sessionId && row.sampleTime
                  ? `${row.sessionId}-${new Date(row.sampleTime).getTime()}`
                  : `row-${row.sessionId || 'unknown'}-${idx}`;
                let sampleTimeStr = '';
                if (row.sampleTime) {
                  try {
                    const d = new Date(row.sampleTime);
                    if (!isNaN(d.getTime())) sampleTimeStr = d.toLocaleString();
                  } catch {}
                }
                return (
                  <TableRow key={key}>
                    <TableCell>{row.sessionId}</TableCell>
                    <TableCell>{row.username}</TableCell>
                    <TableCell>
                      <Chip label={row.sqlId} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.waitClass} 
                        size="small" 
                        color={row.waitClass === 'User I/O' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{row.waitEvent}</TableCell>
                    <TableCell>{row.module ?? ''}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.sessionState} 
                        size="small" 
                        color={row.sessionState === 'ON CPU' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{sampleTimeStr}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AshAnalysis;
