import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';
import AshAnalysis from './pages/AshAnalysis';
import AwrReports from './pages/AwrReports';
import SqlAnalysis from './pages/SqlAnalysis';
import OrdsMonitoring from './pages/OrdsMonitoring';
import WaitEvents from './pages/WaitEvents';
import SystemMetrics from './pages/SystemMetrics';
import DatabaseConfig from './pages/DatabaseConfig';
import { DatabaseServiceProvider } from './contexts/DatabaseContext';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const drawerWidth = 240;

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DatabaseServiceProvider>
        <Box sx={{ display: 'flex' }}>
          <Sidebar drawerWidth={drawerWidth} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              p: 3,
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              ml: { sm: `${drawerWidth}px` },
              minHeight: '100vh',
            }}
          >
            <Routes>
              <Route path="/config" element={
                <ErrorBoundary>
                  <DatabaseConfig />
                </ErrorBoundary>
              } />
              <Route path="/system" element={
                <ErrorBoundary>
                  <SystemMetrics />
                </ErrorBoundary>
              } />
              <Route path="/waits" element={
                <ErrorBoundary>
                  <WaitEvents />
                </ErrorBoundary>
              } />
              <Route path="/sql" element={
                <ErrorBoundary>
                  <SqlAnalysis />
                </ErrorBoundary>
              } />
              <Route path="/ash" element={
                <ErrorBoundary>
                  <AshAnalysis />
                </ErrorBoundary>
              } />
              <Route path="/" element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="/awr" element={
                <ErrorBoundary>
                  <AwrReports />
                </ErrorBoundary>
              } />
              <Route path="/ords" element={
                <ErrorBoundary>
                  <OrdsMonitoring />
                </ErrorBoundary>
              } />
              {/* Other routes can be added back as needed */}
            </Routes>
          </Box>
        </Box>
      </DatabaseServiceProvider>
    </ThemeProvider>
  );
}

export default App;
