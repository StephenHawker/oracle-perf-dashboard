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
} from 'recharts';
import { useDatabaseService } from '../contexts/DatabaseContext';
import { AwrSnapshot } from '../types/oracleTypes';
import { WaitEvent, TopSqlAnalysis, SystemMetric } from '../types/oracleTypes';

const AwrReports: React.FC = () => {
  const { service, isConnected, filters, error } = useDatabaseService();
  const [loading, setLoading] = useState(true);
  const [snapshots, setSnapshots] = useState<AwrSnapshot[]>([]);
  const [waitEvents, setWaitEvents] = useState<WaitEvent[]>([]);
  const [topSql, setTopSql] = useState<TopSqlAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!service || !isConnected) return;
      try {
        setLoading(true);
        const [snapData, waitData, sqlData, sysData, perfSummary] = await Promise.all([
          service.getAwrSnapshots(filters),
          service.getTopWaitEvents(filters),
          service.getTopSqlStatements(filters),
          service.getSystemMetrics(filters),
          service.getPerformanceSummary(filters)
        ]);
        setSnapshots(snapData);
        setWaitEvents(waitData);
        setTopSql(sqlData);
        setSystemMetrics(sysData);
        setRecommendations(perfSummary.recommendations || []);
      } catch (err) {
        console.error('Failed to fetch AWR data:', err);
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

  const chartData = snapshots.map(snap => ({
    time: snap.snapTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
    dbTime: snap.dbTime / 1000000,
    cpuTime: snap.dbCpuTime / 1000000,
    elapsedTime: snap.elapsedTime / 1000000,
    logicalReads: snap.logical_reads,
    physicalReads: snap.physical_reads,
    physicalWrites: snap.physical_writes,
    userCalls: snap.user_calls,
    parses: snap.parses,
    hardParses: snap.hard_parses,
    sorts: snap.sorts,
    logons: snap.logons,
    executes: snap.executes,
    transactions: snap.transactions
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AWR (Automatic Workload Repository) Reports
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Historical database performance data and workload analysis
      </Typography>

      {/* Key Metrics */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Total Snapshots</Typography>
            <Typography variant="h5" component="div">{snapshots.length}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Avg DB Time</Typography>
            <Typography variant="h5" component="div">{snapshots.length > 0 ? (snapshots.reduce((sum, s) => sum + s.dbTime, 0) / snapshots.length / 1000000).toFixed(1) + 's' : '0s'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Avg CPU Time</Typography>
            <Typography variant="h5" component="div">{snapshots.length > 0 ? (snapshots.reduce((sum, s) => sum + s.dbCpuTime, 0) / snapshots.length / 1000000).toFixed(1) + 's' : '0s'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Avg Physical Reads</Typography>
            <Typography variant="h5" component="div">{snapshots.length > 0 ? (snapshots.reduce((sum, s) => sum + s.physical_reads, 0) / snapshots.length).toFixed(0) : '0'}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: '1 1 200px' }}>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>Avg Executions</Typography>
            <Typography variant="h5" component="div">{snapshots.length > 0 ? (snapshots.reduce((sum, s) => sum + s.executes, 0) / snapshots.length).toFixed(0) : '0'}</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Database Time Trends */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Database Time Trends</Typography>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tickFormatter={v => v}
              interval={Math.floor(chartData.length / 8)}
              label={{ value: 'Time (hh:mm AM/PM)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              label={{ value: 'Value', angle: -90, position: 'insideLeft', offset: 10 }}
            />
            <Tooltip
              labelFormatter={label => `Time: ${label}`}
              formatter={(value: any, name: string) => {
                switch (name) {
                  case 'DB Time (s)':
                  case 'CPU Time (s)':
                    return [`${value} s`, name];
                  case 'Physical Reads':
                  case 'Executions':
                    return [value, name];
                  default:
                    return [value, name];
                }
              }}
            />
            <Line type="monotone" dataKey="dbTime" stroke="#8884d8" name="DB Time (s)" />
            <Line type="monotone" dataKey="cpuTime" stroke="#82ca9d" name="CPU Time (s)" />
            <Line type="monotone" dataKey="physicalReads" stroke="#ff9800" name="Physical Reads" />
            <Line type="monotone" dataKey="executes" stroke="#4caf50" name="Executions" />
          </LineChart>
        </ResponsiveContainer>
        <Box mt={1}>
          <Typography variant="caption" color="text.secondary">
            X-axis: Time (hh:mm AM/PM) &nbsp;|&nbsp; DB Time, CPU Time: seconds (s) &nbsp;|&nbsp; Physical Reads, Executions: count
          </Typography>
        </Box>
      </Paper>

      {/* Top Wait Events */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Top Wait Events</Typography>
        {waitEvents.length === 0 ? <Typography>No wait events found.</Typography> : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Event Name</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Wait Class</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Total Waits</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Total Time Waited (s)</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Avg Wait (ms)</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Waits/sec</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Time Waited/sec (ms)</th>
                </tr>
              </thead>
              <tbody>
                {waitEvents.map((event, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>{event.eventName}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>{event.waitClass}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{event.totalWaits}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{event.timeWaited}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{event.averageWait}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{event.waitsPerSecond}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{event.timeWaitedPerSecond}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      {/* Top SQL Statements */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Top SQL Statements</Typography>
        {topSql.length === 0 ? <Typography>No SQL statements found.</Typography> : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>SQL ID</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Text</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Executions</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Elapsed Time (s)</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>CPU Time (s)</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Module</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Schema</th>
                </tr>
              </thead>
              <tbody>
                {topSql.map((sql) => (
                  <tr key={sql.sqlId}>
                    <td style={{ padding: '6px', border: '1px solid #ddd', fontFamily: 'monospace' }}>{sql.sqlId}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', maxWidth: 350, whiteSpace: 'pre-line', wordBreak: 'break-all' }}>{sql.sqlText}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{sql.executions}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{sql.elapsedTime}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{sql.cpuTime}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>{sql.module}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>{sql.parsingSchema}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      {/* Recommendations */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Recommendations</Typography>
        {recommendations.length === 0 ? <Typography>No recommendations found.</Typography> : (
          <Box component="ul" sx={{ pl: 2 }}>
            {recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </Box>
        )}
      </Paper>

      {/* System Metrics */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>System Metrics</Typography>
        {systemMetrics.length === 0 ? <Typography>No system metrics found.</Typography> : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Metric Name</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Value</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Unit</th>
                  <th style={{ padding: '6px', border: '1px solid #ddd' }}>Instance</th>
                </tr>
              </thead>
              <tbody>
                {systemMetrics.slice(0, 10).map((metric, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>{metric.metricName}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{metric.value}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd' }}>{metric.unit}</td>
                    <td style={{ padding: '6px', border: '1px solid #ddd', textAlign: 'right' }}>{metric.instanceNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AwrReports;
