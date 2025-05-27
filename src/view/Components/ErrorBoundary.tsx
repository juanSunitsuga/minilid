// src/components/ErrorBoundary.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Chat component error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: '100%',
          p: 4
        }}>
          <Typography variant="h5" color="error" mb={2}>
            Something went wrong in the chat component
          </Typography>
          <Typography variant="body1" mb={3}>
            {this.state.error?.message || "An unknown error occurred"}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;