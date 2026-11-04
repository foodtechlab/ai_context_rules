import { Component, type ErrorInfo, type ReactNode } from 'react';

export default class PreviewErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || 'Preview renderer failed' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Design System Studio preview failed', error, info);
  }

  render() {
    if (this.state.error) {
      return <div className="preview-error"><strong>Preview недоступен</strong><span>{this.state.error}</span></div>;
    }
    return this.props.children;
  }
}
