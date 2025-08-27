'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  message?: string
}

export function LoadingSpinner({ size = 'md', className = '', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 text-center">{message}</p>
      )}
    </div>
  )
}