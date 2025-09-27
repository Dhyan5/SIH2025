import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary caught an error:', error, errorInfo);
    
    // Try to recover by reloading after a delay
    setTimeout(() => {
      if (this.state.hasError) {
        console.log('Attempting to recover from error...');
        this.setState({ hasError: false, error: undefined });
      }
    }, 5000);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '500px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca'
            }}>
              <span style={{ fontSize: '32px' }}>⚠️</span>
            </div>
            <h2 style={{ 
              color: '#dc2626', 
              marginBottom: '16px', 
              fontSize: '24px', 
              fontWeight: '600' 
            }}>
              Something went wrong
            </h2>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '16px', 
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              We encountered an unexpected error. The application will automatically try to recover in a few seconds.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
            {this.state.error && (
              <details style={{ 
                marginTop: '24px', 
                textAlign: 'left',
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <summary style={{ 
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginBottom: '8px'
                }}>
                  Error Details
                </summary>
                <pre style={{ 
                  fontSize: '12px',
                  color: '#dc2626',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}