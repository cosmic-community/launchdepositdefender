'use client'

import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useApp } from '@/components/Providers'

export function NotificationToast() {
  const { notifications, removeNotification } = useApp()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const Icon = {
          success: CheckCircle,
          error: AlertCircle,
          warning: AlertTriangle,
          info: Info
        }[notification.type]

        const colorClasses = {
          success: 'bg-success-50 border-success-200 text-success-800',
          error: 'bg-danger-50 border-danger-200 text-danger-800',
          warning: 'bg-warning-50 border-warning-200 text-warning-800',
          info: 'bg-primary-50 border-primary-200 text-primary-800'
        }[notification.type]

        const iconColorClasses = {
          success: 'text-success-600',
          error: 'text-danger-600',
          warning: 'text-warning-600',
          info: 'text-primary-600'
        }[notification.type]

        return (
          <div
            key={notification.id}
            className={`max-w-sm w-full border rounded-lg p-4 shadow-lg animate-slide-up ${colorClasses}`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Icon className={`w-5 h-5 ${iconColorClasses}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-sm mt-1 opacity-90">{notification.message}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}