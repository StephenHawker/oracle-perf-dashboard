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
  TextField,
} from '@mui/material';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { TopSqlAnalysis } from '../types/oracleTypes';

const SqlAnalysis: React.FC = () => {
  const { service, isConnected, filters, error } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [sqlData, setSqlData] = useState<TopSqlAnalysis[]>([]);
  const [expandedSql, setExpandedSql] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!service || !isConnected) return;

      try {
        setLoading(true);
        const data = await service.getTopSqlStatements(filters);
        setSqlData(data);
      } catch (err) {
        console.error('Failed to fetch SQL data:', err);
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

  const formatTime = (microseconds: number) => {
    const seconds = microseconds / 1000000;
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(1)}m`;
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        SQL Analysis
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Performance analysis of SQL statements with execution statistics
      </Typography>

      <Paper sx={{ mt: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SQL ID</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Schema</TableCell>
                <TableCell>Executions</TableCell>
                <TableCell>Elapsed Time</TableCell>
                <TableCell>CPU Time</TableCell>
                <TableCell>Avg Elapsed</TableCell>
                <TableCell>Buffer Gets</TableCell>
                <TableCell>Disk Reads</TableCell>
                <TableCell>Last Active</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sqlData.map((row) => (
                <React.Fragment key={row.sqlId}>
                  <TableRow
                    hover
                    onClick={() => setExpandedSql(expandedSql === row.sqlId ? null : row.sqlId)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Chip label={row.sqlId} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{row.module}</TableCell>
                    <TableCell>{row.parsingSchema}</TableCell>
                    <TableCell>{row.executions?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{formatTime(row.elapsedTime)}</TableCell>
                    <TableCell>{formatTime(row.cpuTime)}</TableCell>
                    <TableCell>{row.avgElapsedTime.toFixed(2)}ms</TableCell>
                    <TableCell>{row.bufferGets?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{row.diskReads?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>{row.lastActiveTime ? new Date(row.lastActiveTime).toLocaleString() : ''}</TableCell>
                  </TableRow>
                  {expandedSql === row.sqlId && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ backgroundColor: '#f5f5f5' }}>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            SQL Text:
                          </Typography>
                          <TextField
                            multiline
                            rows={4}
                            fullWidth
                            value={row.sqlText}
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                            }}
                            sx={{
                              '& .MuiInputBase-input': {
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                              },
                            }}
                          />
                          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                            <Typography variant="body2">
                              Plan Hash: {row.planHashValue}
                            </Typography>
                            <Typography variant="body2">
                              Rows Processed: {row.rowsProcessed?.toLocaleString() || 'N/A'}
                            </Typography>
                            <Typography variant="body2">
                              First Load: {row.firstLoadTime ? new Date(row.firstLoadTime).toLocaleString() : ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default SqlAnalysis;
