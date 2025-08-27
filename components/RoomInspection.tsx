'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Camera, Video, FileText, Check, X } from 'lucide-react'
import { useApp } from '@/components/Providers'
import { Property, Room, ChecklistItem } from '@/types'
import { ChecklistItemCard } from '@/components/ChecklistItemCard'
import { CameraCapture } from '@/components/CameraCapture'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface RoomInspectionProps {
  propertyId: string
  roomId: string
}

export function RoomInspection({ propertyId, roomId }: RoomInspectionProps) {
  const router = useRouter()
  const { properties, updateProperty } = useApp()
  const [property, setProperty] = useState<Property | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [captureType, setCaptureType] = useState<'photo' | 'video'>('photo')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundProperty = properties.find(p => p.id === propertyId)
    if (foundProperty) {
      const foundRoom = foundProperty.rooms.find(r => r.id === roomId)
      if (foundRoom) {
        setProperty(foundProperty)
        setRoom(foundRoom)
      }
    }
    setLoading(false)
  }, [propertyId, roomId, properties])

  const updateRoomProgress = (updatedRoom: Room) => {
    if (!property) return

    const completedItems = updatedRoom.items.filter(item => item.completed).length
    const progressPercentage = (completedItems / updatedRoom.totalItems) * 100

    const updatedRoomWithProgress = {
      ...updatedRoom,
      completedItems,
      progressPercentage,
      lastModified: new Date().toISOString()
    }

    const updatedRooms = property.rooms.map(r => 
      r.id === roomId ? updatedRoomWithProgress : r
    )

    // Calculate overall property progress
    const totalItems = updatedRooms.reduce((sum, r) => sum + r.totalItems, 0)
    const totalCompleted = updatedRooms.reduce((sum, r) => sum + r.completedItems, 0)
    const overallProgress = totalItems > 0 ? (totalCompleted / totalItems) * 100 : 0

    const updatedProperty = {
      ...property,
      rooms: updatedRooms,
      overallProgress
    }

    setProperty(updatedProperty)
    setRoom(updatedRoomWithProgress)
    updateProperty(updatedProperty)
  }

  const handleItemUpdate = (updatedItem: ChecklistItem) => {
    if (!room) return

    const updatedItems = room.items.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    )

    const updatedRoom = {
      ...room,
      items: updatedItems
    }

    updateRoomProgress(updatedRoom)
  }

  const handleCameraCapture = async (mediaFiles: any[]) => {
    if (!selectedItem || !room) return

    const updatedItem = {
      ...selectedItem,
      photos: [...selectedItem.photos, ...mediaFiles.filter(f => f.type === 'image')],
      videos: [...selectedItem.videos, ...mediaFiles.filter(f => f.type === 'video')]
    }

    handleItemUpdate(updatedItem)
    setShowCamera(false)
    setSelectedItem(null)
  }

  const openCamera = (item: ChecklistItem, type: 'photo' | 'video') => {
    setSelectedItem(item)
    setCaptureType(type)
    setShowCamera(true)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!property || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Room Not Found</h2>
          <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/property/${propertyId}`)}
            className="btn-primary"
          >
            Back to Property
          </button>
        </div>
      </div>
    )
  }

  // Group items by category
  const itemsByCategory = room.items.reduce((acc, item) => {
    const category = item.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/property/${propertyId}`)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {room.name}
                </h1>
                <p className="text-sm text-gray-600">
                  {room.completedItems}/{room.totalItems} items completed • {Math.round(room.progressPercentage)}%
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary-600">
                {Math.round(room.progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pb-4">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${room.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {Object.entries(itemsByCategory).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {category}
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({items.filter(item => item.completed).length}/{items.length})
              </span>
            </h2>
            
            <div className="space-y-4">
              {items.map((item) => (
                <ChecklistItemCard
                  key={item.id}
                  item={item}
                  onUpdate={handleItemUpdate}
                  onCameraCapture={(type) => openCamera(item, type)}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Completion Message */}
        {room.progressPercentage === 100 && (
          <div className="mt-8 card bg-success-50 border-success-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-success-100 text-success-600 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-success-800">
                  Room Inspection Complete!
                </h3>
                <p className="text-success-700">
                  You've completed all checklist items for this room. 
                  You can still add more photos or update items as needed.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Camera Modal */}
      {showCamera && selectedItem && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => {
            setShowCamera(false)
            setSelectedItem(null)
          }}
          captureType={captureType}
          itemTitle={selectedItem.text}
        />
      )}
    </div>
  )
}