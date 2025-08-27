'use client'

import { useState } from 'react'
import { useApp } from '@/components/Providers'
import { PropertyCard } from '@/components/PropertyCard'
import { CreatePropertyModal } from '@/components/CreatePropertyModal'
import { Plus, Home, FileText, Settings } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { NotificationToast } from '@/components/NotificationToast'

export function PropertyDashboard() {
  const { properties, loading } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)

  if (loading) {
    return <LoadingSpinner />
  }

  // Show welcome screen if no properties
  if (properties.length === 0) {
    return null // WelcomeScreen will handle this
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 text-white rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                DepositDefender
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Property</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
                <p className="text-sm text-gray-600">
                  {properties.length === 1 ? 'Property' : 'Properties'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success-100 text-success-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {properties.reduce((sum, p) => sum + p.rooms.reduce((roomSum, r) => roomSum + r.completedItems, 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Completed Items</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-warning-100 text-warning-600 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(properties.reduce((sum, p) => sum + p.overallProgress, 0) / properties.length || 0)}%
                </p>
                <p className="text-sm text-gray-600">Average Progress</p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Properties
            </h2>
            <p className="text-sm text-gray-600">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} tracked
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
              />
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="card bg-primary-50 border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Need Help Getting Started?
              </h3>
              <p className="text-gray-700 mb-4">
                DepositDefender guides you through a complete move-out inspection with 
                room-specific checklists and professional documentation features.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                  Privacy-First
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700">
                  Offline Capable
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
                  Professional Reports
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <CreatePropertyModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Notifications */}
      <NotificationToast />
    </div>
  )
}