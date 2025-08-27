'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Share, Home, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { useApp } from '@/components/Providers'
import { Property } from '@/types'
import { RoomCard } from '@/components/RoomCard'
import { ReportGenerator } from '@/components/ReportGenerator'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PropertyInspectionProps {
  propertyId: string
}

export function PropertyInspection({ propertyId }: PropertyInspectionProps) {
  const router = useRouter()
  const { properties, isLoading: appLoading } = useApp()
  const [property, setProperty] = useState<Property | null>(null)
  const [showReportGenerator, setShowReportGenerator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    // Wait for app to finish loading before checking for property
    if (appLoading) {
      return
    }

    // Decode the property ID in case it was URL encoded
    const decodedPropertyId = decodeURIComponent(propertyId)
    
    // Try to find property by exact ID match first
    let foundProperty = properties.find(p => p.id === decodedPropertyId)
    
    // If not found by exact ID, try to find by address (fallback)
    if (!foundProperty && decodedPropertyId) {
      foundProperty = properties.find(p => 
        p.address.toLowerCase().includes(decodedPropertyId.toLowerCase()) ||
        p.id.toLowerCase().includes(decodedPropertyId.toLowerCase())
      )
    }

    if (foundProperty) {
      setProperty(foundProperty)
      setNotFound(false)
    } else if (properties.length > 0) {
      // Only set not found if we have loaded properties but none match
      setNotFound(true)
    }
    
    setLoading(false)
  }, [propertyId, properties, appLoading])

  // Show loading while app is still loading or while we're checking for property
  if (loading || appLoading) {
    return <LoadingSpinner />
  }

  // Show not found only if we're sure the property doesn't exist
  if (notFound || (!property && !appLoading && properties.length > 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or may have been removed.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/')}
              className="btn-primary w-full"
            >
              Back to Dashboard
            </button>
            {properties.length > 0 && (
              <div className="text-sm text-gray-500">
                <p>Available properties:</p>
                <div className="mt-2 space-y-1">
                  {properties.slice(0, 3).map(p => (
                    <button
                      key={p.id}
                      onClick={() => router.push(`/property/${encodeURIComponent(p.id)}`)}
                      className="block w-full text-primary-600 hover:text-primary-800 truncate"
                    >
                      {p.address}
                    </button>
                  ))}
                  {properties.length > 3 && (
                    <p className="text-gray-400">...and {properties.length - 3} more</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading if we still don't have a property but app isn't done loading
  if (!property) {
    return <LoadingSpinner />
  }

  const completedRooms = property.rooms.filter(room => room.progressPercentage === 100).length
  const totalIssues = property.rooms.reduce((sum, room) => 
    sum + room.items.filter(item => item.severity && item.completed).length, 0)

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'Not set'
    }
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <button
                onClick={() => router.push('/')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-gray-900 truncate">
                  {property.address}
                </h1>
                <p className="text-sm text-gray-600">
                  Move-out: {formatDate(property.moveOutDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              {property.overallProgress > 0 && (
                <button
                  onClick={() => setShowReportGenerator(true)}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Generate Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Summary */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Inspection Progress</h2>
            <span className="text-2xl font-bold text-primary-600">
              {Math.round(property.overallProgress)}%
            </span>
          </div>

          <div className="progress-bar mb-4">
            <div 
              className="progress-fill"
              style={{ width: `${property.overallProgress}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-success-100 text-success-600 rounded-lg mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{completedRooms}</p>
              <p className="text-sm text-gray-600">Completed Rooms</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-warning-100 text-warning-600 rounded-lg mx-auto mb-2">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{property.rooms.length - completedRooms}</p>
              <p className="text-sm text-gray-600">Remaining Rooms</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-danger-100 text-danger-600 rounded-lg mx-auto mb-2">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
              <p className="text-sm text-gray-600">Issues Found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Room Inspections
          </h2>
          <p className="text-gray-600">
            Complete each room inspection by following the guided checklists
          </p>
        </div>

        {property.rooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {property.rooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                propertyId={property.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Home className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rooms Yet</h3>
            <p className="text-gray-600 mb-4">
              This property doesn't have any rooms set up for inspection yet.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        )}

        {/* Help Section */}
        {property.rooms.length > 0 && (
          <div className="mt-12">
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Inspection Tips
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>• Take multiple photos of any issues from different angles</li>
                    <li>• Use the severity tags to prioritize issues (minor, moderate, major)</li>
                    <li>• Add detailed notes to provide context for each issue</li>
                    <li>• Complete all rooms before generating your final report</li>
                    <li>• Your data is saved automatically as you work</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Report Generator Modal */}
      {showReportGenerator && (
        <ReportGenerator
          property={property}
          onClose={() => setShowReportGenerator(false)}
        />
      )}
    </div>
  )
}