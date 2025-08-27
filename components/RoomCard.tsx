'use client'

import { Room } from '@/types'
import Link from 'next/link'
import { ChevronRight, CheckCircle2, Clock, Camera, FileText } from 'lucide-react'
import { getRoomTemplate } from '@/lib/room-templates'

interface RoomCardProps {
  room: Room
  propertyId: string
}

export function RoomCard({ room, propertyId }: RoomCardProps) {
  const template = getRoomTemplate(room.type)
  const issuesCount = room.items.filter(item => item.severity && item.completed).length
  const photosCount = room.items.reduce((sum, item) => sum + item.photos.length, 0)
  
  const getStatusIcon = () => {
    if (room.progressPercentage === 100) {
      return <CheckCircle2 className="w-5 h-5 text-success-600" />
    } else if (room.progressPercentage > 0) {
      return <Clock className="w-5 h-5 text-warning-600" />
    }
    return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
  }

  const getStatusText = () => {
    if (room.progressPercentage === 100) {
      return { text: 'Complete', color: 'text-success-600' }
    } else if (room.progressPercentage > 0) {
      return { text: 'In Progress', color: 'text-warning-600' }
    }
    return { text: 'Not Started', color: 'text-gray-500' }
  }

  const status = getStatusText()

  return (
    <Link
      href={`/property/${propertyId}/room/${room.id}`}
      className="block group"
    >
      <div className="card hover:shadow-lg transition-all duration-200 group-hover:border-primary-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{template.icon === 'ChefHat' ? '🍳' : 
                                      template.icon === 'Bath' ? '🛁' : 
                                      template.icon === 'Bed' ? '🛏️' : 
                                      template.icon === 'Sofa' ? '🛋️' : '🏠'}</div>
            <div>
              <h3 className="font-semibold text-gray-900">{room.name}</h3>
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`text-sm ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium text-gray-900">
              {room.completedItems}/{room.totalItems} items
            </span>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${room.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(room.progressPercentage)}%
            </div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-gray-900 flex items-center justify-center space-x-1">
              <Camera className="w-4 h-4" />
              <span>{photosCount}</span>
            </div>
            <div className="text-xs text-gray-500">Photos</div>
          </div>
          
          <div>
            <div className="text-lg font-semibold text-gray-900 flex items-center justify-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>{issuesCount}</span>
            </div>
            <div className="text-xs text-gray-500">Issues</div>
          </div>
        </div>

        {/* Categories Preview */}
        {room.progressPercentage > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Last updated: {new Date(room.lastModified).toLocaleDateString()}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {issuesCount > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {room.items
              .filter(item => item.severity && item.completed)
              .reduce((acc, item) => {
                const severity = item.severity!
                const existing = acc.find(s => s.type === severity)
                if (existing) {
                  existing.count++
                } else {
                  acc.push({ type: severity, count: 1 })
                }
                return acc
              }, [] as Array<{ type: string; count: number }>)
              .map(({ type, count }) => (
                <span
                  key={type}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    type === 'minor' ? 'severity-minor' :
                    type === 'moderate' ? 'severity-moderate' :
                    'severity-major'
                  }`}
                >
                  {count} {type}
                </span>
              ))}
          </div>
        )}
      </div>
    </Link>
  )
}