import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("Ratio Quest error:", error, info);
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="rq-card p-8 max-w-xl mx-auto text-center space-y-4" role="alert" data-testid="error-fallback">
        <h1 className="font-heading text-2xl font-bold text-slate-900">Oops! Something got muddled.</h1>
        <p className="text-slate-700">This part of Ratio Quest had a problem. Your saved progress is safe.</p>
        <a href="/learn" className="rq-btn-primary" data-testid="error-back-btn">
          Back to my lessons
        </a>
      </div>
    );
  }
}
