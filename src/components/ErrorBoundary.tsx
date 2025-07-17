import React from 'react';
import { Alert, Box } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    // You can log errorInfo to an error reporting service here
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
