'use client'

import { useState } from 'react'
import { X, Plus, Home } from 'lucide-react'
import { Room, RoomType } from '@/types'
import { createRoomFromTemplate, getRoomTemplate, getAllRoomTypes } from '@/lib/room-templates'

interface AddRoomModalProps {
  isOpen: boolean
  onClose: () => void
  onAddRoom: (room: Room) => void
  existingRoomNames: string[]
}

export function AddRoomModal({ isOpen, onClose, onAddRoom, existingRoomNames }: AddRoomModalProps) {
  const [selectedType, setSelectedType] = useState<RoomType>('bedroom')
  const [customName, setCustomName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const template = getRoomTemplate(selectedType)
      let roomName = customName.trim()
      
      // If no custom name provided, use template name
      if (!roomName) {
        roomName = template.displayName
      }
      
      // Check for duplicate names and append number if needed
      let finalName = roomName
      let counter = 1
      while (existingRoomNames.some(name => name.toLowerCase() === finalName.toLowerCase())) {
        finalName = `${roomName} ${counter + 1}`
        counter++
      }

      const newRoom = createRoomFromTemplate(selectedType, finalName)
      onAddRoom(newRoom)
      
      // Reset form
      setCustomName('')
      setSelectedType('bedroom')
    } catch (error) {
      console.error('Error adding room:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCustomName('')
    setSelectedType('bedroom')
    onClose()
  }

  const roomTypes = getAllRoomTypes()

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Add New Room</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Room Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Room Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roomTypes.map((type) => {
                  const template = getRoomTemplate(type)
                  const isSelected = selectedType === type
                  
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-primary-200 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">
                          {template.icon === 'ChefHat' ? '🍳' : 
                           template.icon === 'Bath' ? '🛁' : 
                           template.icon === 'Bed' ? '🛏️' : 
                           template.icon === 'Sofa' ? '🛋️' : '🏠'}
                        </span>
                        <div>
                          <div className="font-medium text-sm">{template.displayName}</div>
                          <div className="text-xs opacity-75">
                            {template.items.length} items
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Custom Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Name (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={`e.g., ${getRoomTemplate(selectedType).displayName}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use default name: "{getRoomTemplate(selectedType).displayName}"
              </p>
            </div>

            {/* Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
              <div className="text-sm text-gray-600">
                <div className="flex items-center space-x-2 mb-1">
                  <span>
                    {getRoomTemplate(selectedType).icon === 'ChefHat' ? '🍳' : 
                     getRoomTemplate(selectedType).icon === 'Bath' ? '🛁' : 
                     getRoomTemplate(selectedType).icon === 'Bed' ? '🛏️' : 
                     getRoomTemplate(selectedType).icon === 'Sofa' ? '🛋️' : '🏠'}
                  </span>
                  <span className="font-medium">
                    {customName.trim() || getRoomTemplate(selectedType).displayName}
                  </span>
                </div>
                <div className="text-xs">
                  {getRoomTemplate(selectedType).items.length} checklist items included
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Room</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}