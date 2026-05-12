'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center p-6 max-w-2xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Что-то пошло не так
            </h2>
            <p className="text-gray-600 mb-2">
              Произошла ошибка при загрузке этого компонента
            </p>
            {this.state.error && (
              <pre className="text-left text-xs bg-red-50 border border-red-200 rounded p-3 mb-4 overflow-auto max-h-48 text-red-800">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            )}
            <button
              onClick={this.resetError}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Простой компонент для отображения ошибок
export function ErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="text-center p-6 max-w-md">
        <div className="text-red-500 text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Ошибка загрузки
        </h2>
        <p className="text-gray-600 mb-4">
          {error?.message || 'Произошла неизвестная ошибка'}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  )
}