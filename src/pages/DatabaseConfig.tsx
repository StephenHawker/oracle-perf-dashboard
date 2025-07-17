import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { useDatabaseService } from '../contexts/DatabaseContext';
import type { DatabaseConfig as DatabaseConfigType } from '../types/oracleTypes';

const DatabaseConfigPage: React.FC = () => {
  const { config, isConnected, connect, disconnect, error } = useDatabaseService();
  const [formData, setFormData] = useState<DatabaseConfigType>({
    type: 'sqlite',
    filePath: './oracle_perf.db',
  });
  const [connecting, setConnecting] = useState(false);

  const handleInputChange = (field: keyof DatabaseConfigType, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConnect = async () => {
    try {
      setConnecting(true);
      await connect(formData);
    } catch (err) {
      console.error('Connection failed:', err);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const resetToSqlite = () => {
    setFormData({
      type: 'sqlite',
      filePath: './oracle_perf.db',
    });
  };

  const resetToOracle = () => {
    setFormData({
      type: 'oracle',
      host: 'localhost',
      port: 1521,
      serviceName: 'ORCL',
      username: '',
      password: '',
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Database Configuration
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Configure database connection settings for Oracle or SQLite
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Current Connection Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Connection
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip 
              label={isConnected ? 'Connected' : 'Disconnected'} 
              color={isConnected ? 'success' : 'error'} 
            />
            {config && (
              <Typography variant="body2" color="text.secondary">
                {config.type === 'sqlite' 
                  ? `SQLite: ${config.filePath}` 
                  : `Oracle: ${config.host}:${config.port}/${config.serviceName}`
                }
              </Typography>
            )}
          </Box>
          {isConnected && (
            <Button 
              variant="outlined" 
              color="error" 
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Connection Configuration */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Database Connection Settings
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Database Type</InputLabel>
          <Select
            value={formData.type}
            label="Database Type"
            onChange={(e) => handleInputChange('type', e.target.value)}
          >
            <MenuItem value="sqlite">SQLite (Development/Testing)</MenuItem>
            <MenuItem value="oracle">Oracle Database</MenuItem>
          </Select>
        </FormControl>

        {formData.type === 'sqlite' ? (
          <Box>
            <TextField
              fullWidth
              label="SQLite File Path"
              value={formData.filePath || ''}
              onChange={(e) => handleInputChange('filePath', e.target.value)}
              sx={{ mb: 2 }}
              helperText="Path to SQLite database file for development and testing"
            />
            <Alert severity="info" sx={{ mb: 2 }}>
              SQLite mode uses mock data for development and testing. 
              This allows you to explore the dashboard features without connecting to a real Oracle database.
            </Alert>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Host"
                value={formData.host || ''}
                onChange={(e) => handleInputChange('host', e.target.value)}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Port"
                type="number"
                value={formData.port || 1521}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                sx={{ width: 120 }}
              />
            </Box>
            
            <TextField
              fullWidth
              label="Service Name"
              value={formData.serviceName || ''}
              onChange={(e) => handleInputChange('serviceName', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Username"
              value={formData.username || ''}
              onChange={(e) => handleInputChange('username', e.target.value)}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password || ''}
              onChange={(e) => handleInputChange('password', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Alert severity="warning" sx={{ mb: 2 }}>
              Oracle connection is not yet implemented in this demo. 
              Please use SQLite mode for now.
            </Alert>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleConnect}
            disabled={connecting || (formData.type === 'oracle')}
            sx={{ minWidth: 120 }}
          >
            {connecting ? 'Connecting...' : 'Connect'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={resetToSqlite}
          >
            Reset to SQLite
          </Button>
          
          <Button
            variant="outlined"
            onClick={resetToOracle}
            disabled
          >
            Reset to Oracle (Coming Soon)
          </Button>
        </Box>
      </Paper>

      {/* Quick Setup Guide */}
      <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h6" gutterBottom>
          Quick Setup Guide
        </Typography>
        
        <Typography variant="subtitle2" gutterBottom>
          For Development (SQLite):
        </Typography>
        <Typography variant="body2" paragraph>
          1. Keep the default SQLite settings<br/>
          2. Click "Connect" to use mock data<br/>
          3. Explore all dashboard features with sample Oracle performance data
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          For Production (Oracle):
        </Typography>
        <Typography variant="body2" paragraph>
          1. Ensure Oracle database is accessible<br/>
          2. Create a monitoring user with appropriate privileges<br/>
          3. Grant access to V$ASH, DBA_HIST_*, and other performance views<br/>
          4. Configure ORDS if using REST API monitoring<br/>
          5. Enter connection details and click "Connect"
        </Typography>

        <Alert severity="info">
          <Typography variant="body2">
            <strong>Required Oracle Privileges:</strong><br/>
            • SELECT on V$ASH, V$SESSION, V$SQL<br/>
            • SELECT on DBA_HIST_SNAPSHOT, DBA_HIST_SQLSTAT<br/>
            • SELECT on V$SYSTEM_EVENT, V$SESSION_WAIT<br/>
            • Access to ORDS monitoring tables (if using ORDS)
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
};

export default DatabaseConfigPage;
