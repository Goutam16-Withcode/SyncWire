import React from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[#110e1f] text-white flex flex-col items-center justify-center p-6 select-none">
                    <div className="bg-[#1e1534] border border-white/15 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-400 mx-auto flex items-center justify-center">
                            <AlertTriangle size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-white">Something went wrong</h2>
                        <p className="text-xs text-gray-300">
                            SyncWire encountered an unexpected interface issue. Click below to reload and restore your session smoothly.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl font-semibold text-xs transition cursor-pointer hover:opacity-90 shadow-lg flex items-center justify-center gap-2"
                        >
                            <RotateCw size={14} />
                            <span>Reload SyncWire</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
