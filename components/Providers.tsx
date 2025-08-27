'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Property, AppNotification } from '@/types'
import { dbManager } from '@/lib/db'

interface AppContextType {
  properties: Property[]
  currentProperty: Property | null
  notifications: AppNotification[]
  loading: boolean
  setCurrentProperty: (property: Property | null) => void
  addNotification: (notification: Omit<AppNotification, 'id'>) => void
  removeNotification: (id: string) => void
  refreshProperties: () => Promise<void>
  updateProperty: (property: Property) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within a Providers component')
  }
  return context
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [currentProperty, setCurrentProperty] = useState<Property | null>(null)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  // Initialize database and load properties
  useEffect(() => {
    async function initialize() {
      try {
        await dbManager.init()
        await refreshProperties()
      } catch (error) {
        console.error('Failed to initialize app:', error)
        addNotification({
          type: 'error',
          title: 'Initialization Error',
          message: 'Failed to load application data. Please refresh the page.',
          duration: 0 // Persistent error
        })
      } finally {
        setLoading(false)
      }
    }

    initialize()
  }, [])

  const refreshProperties = async () => {
    try {
      const loadedProperties = await dbManager.getAllProperties()
      setProperties(loadedProperties)
    } catch (error) {
      console.error('Failed to load properties:', error)
      addNotification({
        type: 'error',
        title: 'Load Error',
        message: 'Failed to load properties from storage.'
      })
    }
  }

  const updateProperty = async (property: Property) => {
    try {
      await dbManager.saveProperty(property)
      
      // Update local state
      setProperties(prev => 
        prev.map(p => p.id === property.id ? property : p)
      )
      
      // Update current property if it's the same one
      if (currentProperty?.id === property.id) {
        setCurrentProperty(property)
      }

      addNotification({
        type: 'success',
        title: 'Saved',
        message: 'Property data has been saved successfully.'
      })
    } catch (error) {
      console.error('Failed to save property:', error)
      addNotification({
        type: 'error',
        title: 'Save Error',
        message: 'Failed to save property data. Please try again.'
      })
      throw error
    }
  }

  const deleteProperty = async (id: string) => {
    try {
      await dbManager.deleteProperty(id)
      
      // Update local state
      setProperties(prev => prev.filter(p => p.id !== id))
      
      // Clear current property if it's the deleted one
      if (currentProperty?.id === id) {
        setCurrentProperty(null)
      }

      addNotification({
        type: 'success',
        title: 'Deleted',
        message: 'Property has been deleted successfully.'
      })
    } catch (error) {
      console.error('Failed to delete property:', error)
      addNotification({
        type: 'error',
        title: 'Delete Error',
        message: 'Failed to delete property. Please try again.'
      })
      throw error
    }
  }

  const addNotification = (notification: Omit<AppNotification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: AppNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000 // Default 5 seconds
    }

    setNotifications(prev => [...prev, newNotification])

    // Auto-remove notification after duration (unless duration is 0 for persistent)
    // Fix: Add explicit check for duration being defined and greater than 0
    const duration = newNotification.duration
    if (duration && duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const contextValue: AppContextType = {
    properties,
    currentProperty,
    notifications,
    loading,
    setCurrentProperty,
    addNotification,
    removeNotification,
    refreshProperties,
    updateProperty,
    deleteProperty
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}