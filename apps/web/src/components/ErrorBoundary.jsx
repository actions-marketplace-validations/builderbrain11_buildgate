import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#040711] text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full p-8 rounded-3xl organic-glass border border-rose-500/30 shadow-2xl relative overflow-hidden">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6 shadow-lg shadow-rose-950/50">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Render Error Encountered
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Buildgate caught a client-side execution error. Details below:
            </p>

            <div className="p-4 rounded-xl bg-black/50 border border-white/[0.08] font-mono text-xs text-rose-300 overflow-x-auto mb-6">
              {this.state.error?.toString()}
            </div>

            <button
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-extrabold text-xs transition shadow-lg shadow-sky-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Buildgate Dashboard</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
