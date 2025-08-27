'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'
import { InstallPromptEvent } from '@/types'

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as InstallPromptEvent)
      
      // Show prompt after a delay
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (!dismissed) {
          setShowPrompt(true)
        }
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA installation accepted')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Installation failed:', error)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              Install DepositDefender
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Add to your home screen for quick access and offline use
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleInstall}
                className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded hover:bg-primary-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-1" />
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Not now
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}