'use client'

import { Property } from '@/types'
import { useApp } from '@/components/Providers'
import { Calendar, MapPin, FileText, Trash2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { deleteProperty } = useApp()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const completedRooms = property.rooms.filter(room => room.progressPercentage === 100).length
  const totalItems = property.rooms.reduce((sum, room) => sum + room.totalItems, 0)
  const completedItems = property.rooms.reduce((sum, room) => sum + room.completedItems, 0)

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsDeleting(true)
    try {
      await deleteProperty(property.id)
    } catch (error) {
      console.error('Delete failed:', error)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="card hover:shadow-lg transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {property.address}
          </h3>
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
            <span>Move-out: {formatDate(property.moveOutDate)}</span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`p-2 rounded-lg transition-colors ${
              showDeleteConfirm 
                ? 'bg-danger-100 text-danger-700 hover:bg-danger-200' 
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={showDeleteConfirm ? 'Click again to confirm deletion' : 'Delete property'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-semibold text-primary-600">
            {Math.round(property.overallProgress)}%
          </span>
        </div>
        
        <div className="progress-bar mb-3">
          <div 
            className="progress-fill"
            style={{ width: `${property.overallProgress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success-500 rounded-full" />
            <span className="text-gray-600">
              {completedRooms}/{property.rooms.length} rooms
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full" />
            <span className="text-gray-600">
              {completedItems}/{totalItems} items
            </span>
          </div>
        </div>
      </div>

      {/* Room Status */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Room Status</h4>
        <div className="space-y-2">
          {property.rooms.slice(0, 3).map((room) => (
            <div key={room.id} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 truncate flex-1">
                {room.name}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${room.progressPercentage}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">
                  {Math.round(room.progressPercentage)}%
                </span>
              </div>
            </div>
          ))}
          {property.rooms.length > 3 && (
            <div className="text-xs text-gray-500 pt-1">
              +{property.rooms.length - 3} more rooms
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Link
          href={`/property/${property.id}`}
          className="flex-1 btn-primary text-center flex items-center justify-center space-x-2"
        >
          <span>Continue Inspection</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
        
        {property.overallProgress > 0 && (
          <button
            className="btn-secondary flex items-center space-x-2"
            title="Generate Report"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Created {formatDate(property.createdAt)}</span>
          <span>
            Last updated {property.rooms.length > 0 
              ? formatDate(Math.max(...property.rooms.map(r => new Date(r.lastModified).getTime())).toString())
              : 'Never'
            }
          </span>
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-danger-100 text-danger-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Delete Property?</h4>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete all inspection data. This action cannot be undone.
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 btn-danger text-sm"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}