'use client'

import { useState } from 'react'

interface SafeButtonProps {
  onClick?: () => void | Promise<void>
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  title?: string
}

export function SafeButton({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading: externalLoading = false,
  className = '',
  type = 'button',
  title,
}: SafeButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  
  const isLoading = externalLoading || internalLoading
  const isDisabled = disabled || isLoading

  const handleClick = async () => {
    if (!onClick || isDisabled) return

    try {
      setInternalLoading(true)
      await onClick()
    } catch (error) {
      console.error('Button click error:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-900'
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm'
      case 'md':
        return 'px-4 py-2 text-sm'
      case 'lg':
        return 'px-6 py-3 text-base'
      default:
        return 'px-4 py-2 text-sm'
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      title={title}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()} ${getSizeStyles()} ${className}
      `}
    >
      {isLoading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}