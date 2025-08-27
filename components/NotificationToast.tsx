'use client'

import { useApp } from '@/components/Providers'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export function NotificationToast() {
  const { notifications, removeNotification } = useApp()

  if (notifications.length === 0) return null

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-danger-600" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-600" />
      default:
        return <Info className="w-5 h-5 text-primary-600" />
    }
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200'
      case 'error':
        return 'bg-danger-50 border-danger-200'
      case 'warning':
        return 'bg-warning-50 border-warning-200'
      default:
        return 'bg-primary-50 border-primary-200'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm p-4 border rounded-lg shadow-lg animate-slide-up ${getStyles(notification.type)}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}