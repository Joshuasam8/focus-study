import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FocusStudy Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGuestFallback = () => {
    localStorage.setItem('focusstudy_is_guest', 'true');
    this.setState({ hasError: false, error: null });
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      let errorDetails = '';
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          errorDetails = parsed.error || this.state.error.message;
        }
      } catch {
        errorDetails = this.state.error?.message || 'An unexpected error occurred.';
      }

      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-800/80 border border-slate-700/80 p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white tracking-tight">Something went wrong</h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                FocusStudy encountered a runtime error. Don't worry, your study data can be safely resumed.
              </p>
              {errorDetails && (
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-rose-300 font-mono text-left overflow-auto max-h-24">
                  {errorDetails}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGuestFallback}
                className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-2 border border-slate-600"
              >
                <span>Continue in Offline Guest Mode</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
