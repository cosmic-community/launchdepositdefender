'use client'

import { useEffect } from 'react'
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useApp } from '@/components/Providers'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function NotificationToast() {
  const { notifications, removeNotification } = useApp()

  return (
    <ToastProvider>
      {notifications.map((notification) => {
        const Icon = {
          success: CheckCircle,
          error: AlertCircle,
          warning: AlertTriangle,
          info: Info
        }[notification.type]

        const variant = notification.type === 'error' ? 'destructive' : 
                      notification.type === 'success' ? 'success' : 'default'

        return (
          <Toast
            key={notification.id}
            variant={variant}
            duration={notification.type === 'error' ? 6000 : 4000}
            onOpenChange={(open) => {
              if (!open) {
                removeNotification(notification.id)
              }
            }}
          >
            <div className="flex items-start space-x-3">
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <ToastTitle>{notification.title}</ToastTitle>
                <ToastDescription>{notification.message}</ToastDescription>
              </div>
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}