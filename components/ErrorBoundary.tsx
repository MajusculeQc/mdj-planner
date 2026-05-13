import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('[ErrorBoundary] Caught:', error.message, errorInfo.componentStack);

        // Handle dynamic import failures (stale assets)
        if (error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('loading chunk') ||
            error.name === 'ChunkLoadError') {
            console.warn('[ErrorBoundary] Detected stale assets. Reloading...');
            window.location.reload();
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (!this.state.hasError) return this.props.children;

        if (this.props.fallback) return this.props.fallback;

        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-gray-900 border border-red-500/30 rounded-2xl p-8 max-w-md text-center shadow-2xl">
                    <div className="text-5xl mb-4">🚨</div>
                    <h2 className="text-xl font-bold text-white mb-2">
                        Oups! Une erreur est survenue
                    </h2>
                    <p className="text-sm text-gray-400 mb-4">
                        {this.state.error?.message ?? 'Erreur inattendue'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={this.handleReset}
                            className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-sm font-bold hover:bg-cyan-500/30 transition-colors"
                        >
                            Réessayer
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg text-sm font-bold hover:bg-white/10 transition-colors"
                        >
                            Recharger la page
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ErrorBoundary;
