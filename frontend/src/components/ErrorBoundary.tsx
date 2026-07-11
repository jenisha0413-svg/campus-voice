import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-8 text-center">
          <div className="card max-w-md">
            <h1 className="mb-2 text-xl font-bold text-red-400">Something went wrong</h1>
            <p className="mb-4 text-sm text-gray-400">{this.state.error}</p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: "" });
                window.location.href = "/";
              }}
              className="btn-primary"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
