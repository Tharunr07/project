import { Component } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'

/**
 * Global React Error Boundary.
 *
 * Catches rendering errors anywhere in the child tree and displays a
 * recovery UI instead of a white screen. Logs the full error to the
 * browser console for debugging.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack)
    console.error('[ErrorBoundary] Error:', error)
    this.setState({ errorInfo })
  }

  handleRetry = () => {
    this.setState({ error: null, errorInfo: null })
  }

  handleGoHome = () => {
    this.setState({ error: null, errorInfo: null })
    window.location.href = '/admin/dashboard'
  }

  render() {
    if (this.state.error) {
      return (
        <div className="grid min-h-[60vh] place-content-center px-4">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-crimson-50">
              <AlertTriangle className="text-crimson-600" size={28} />
            </div>

            <h2 className="font-display text-xl font-extrabold text-navy-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-500">
              An unexpected error occurred while rendering this page.
              The error has been logged to the browser console.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 rounded-xl border border-sand-300 bg-white px-5 py-2.5 text-sm font-bold text-navy-700 transition-colors hover:bg-sand-50"
              >
                <LayoutDashboard size={16} />
                Go to Dashboard
              </button>
            </div>

            {import.meta.env.DEV && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-xs font-bold text-navy-400">
                  Error details (development only)
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto rounded-xl bg-navy-50 p-3 text-xs text-navy-700">
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
