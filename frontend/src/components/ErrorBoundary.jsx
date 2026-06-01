import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div style={{ 
                    textAlign: 'center', 
                    marginTop: '50px', 
                    fontFamily: 'sans-serif', 
                    color: '#333' 
                }}>
                    <h1 style={{ fontSize: '3em', color: '#e74c3c' }}>Something went wrong.</h1>
                    <p style={{ fontSize: '1.2em', color: '#555' }}>
                        We're sorry, but an unexpected error occurred. Please try refreshing the page.
                    </p>
                    {/* Optionally display error details in development */}
                    {import.meta.env.MODE === 'development' && this.state.errorInfo && (
                        <details style={{ marginTop: '20px', whiteSpace: 'pre-wrap', textAlign: 'left', display: 'inline-block', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '5px' }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details</summary>
                            {this.state.error && this.state.error.toString()}
                            <br />
                            {this.state.errorInfo.componentStack}
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
