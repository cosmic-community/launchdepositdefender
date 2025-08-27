'use client'

import { useState } from 'react'
import { ChecklistItem, SeverityLevel } from '@/types'
import { Check, Camera, Video, FileText, X, Trash2 } from 'lucide-react'
import { MediaProcessor } from '@/lib/media-utils'

interface ChecklistItemCardProps {
  item: ChecklistItem
  onUpdate: (item: ChecklistItem) => void
  onCameraCapture: (type: 'photo' | 'video') => void
}

export function ChecklistItemCard({ item, onUpdate, onCameraCapture }: ChecklistItemCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(item.notes || '')

  const handleToggleComplete = () => {
    onUpdate({
      ...item,
      completed: !item.completed,
      severity: !item.completed ? undefined : item.severity
    })
  }

  const handleSeverityChange = (severity: SeverityLevel | undefined) => {
    onUpdate({
      ...item,
      severity,
      completed: true
    })
  }

  const handleNotesSubmit = () => {
    onUpdate({
      ...item,
      notes: notes.trim() || undefined
    })
    setShowNotes(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const validation = MediaProcessor.validateMediaFile(file, type)
      if (!validation.valid) {
        alert(validation.error)
        return
      }

      const mediaFile = await MediaProcessor.processMediaFile(file, type)
      
      const updatedItem = {
        ...item,
        [type === 'image' ? 'photos' : 'videos']: [
          ...item[type === 'image' ? 'photos' : 'videos'],
          mediaFile
        ]
      }

      onUpdate(updatedItem)
    } catch (error) {
      console.error('Failed to process file:', error)
      alert('Failed to process file. Please try again.')
    }

    // Reset file input
    event.target.value = ''
  }

  const handleRemoveMedia = (mediaId: string, type: 'photos' | 'videos') => {
    const updatedItem = {
      ...item,
      [type]: item[type].filter(media => media.id !== mediaId)
    }

    // Cleanup object URL if it exists
    const media = item[type].find(m => m.id === mediaId)
    if (media) {
      MediaProcessor.cleanupObjectUrl(media.dataUrl)
    }

    onUpdate(updatedItem)
  }

  const severityOptions: { value: SeverityLevel; label: string; color: string }[] = [
    { value: 'minor', label: 'Minor', color: 'severity-minor' },
    { value: 'moderate', label: 'Moderate', color: 'severity-moderate' },
    { value: 'major', label: 'Major', color: 'severity-major' }
  ]

  return (
    <div className={`checklist-item ${item.completed ? 'completed' : 'incomplete'}`}>
      {/* Checkbox and Item Text */}
      <div className="flex items-start space-x-3 flex-1">
        <button
          onClick={handleToggleComplete}
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
            item.completed
              ? 'bg-success-500 border-success-500 text-white'
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {item.completed && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${item.completed ? 'text-success-800' : 'text-gray-900'}`}>
            {item.text}
          </p>

          {/* Severity Selection */}
          {item.completed && (
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-xs text-gray-600">Issue severity:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSeverityChange(undefined)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    !item.severity
                      ? 'bg-gray-200 text-gray-800'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  No Issue
                </button>
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSeverityChange(option.value)}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      item.severity === option.value
                        ? option.color
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {showNotes ? (
            <div className="mt-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this item..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={3}
              />
              <div className="flex items-center space-x-2 mt-2">
                <button
                  onClick={handleNotesSubmit}
                  className="btn-primary text-sm py-1 px-3"
                >
                  Save Notes
                </button>
                <button
                  onClick={() => {
                    setShowNotes(false)
                    setNotes(item.notes || '')
                  }}
                  className="btn-secondary text-sm py-1 px-3"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : item.notes ? (
            <div className="mt-2">
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                {item.notes}
              </p>
              <button
                onClick={() => setShowNotes(true)}
                className="text-xs text-primary-600 hover:text-primary-700 mt-1"
              >
                Edit notes
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className="text-xs text-gray-500 hover:text-primary-600 mt-2 flex items-center space-x-1"
            >
              <FileText className="w-3 h-3" />
              <span>Add notes</span>
            </button>
          )}

          {/* Media Section */}
          {(item.photos.length > 0 || item.videos.length > 0) && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {item.photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.dataUrl}
                      alt="Inspection photo"
                      className="media-thumbnail"
                    />
                    <button
                      onClick={() => handleRemoveMedia(photo.id, 'photos')}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {item.videos.map((video) => (
                  <div key={video.id} className="relative group">
                    <video
                      src={video.dataUrl}
                      className="media-thumbnail"
                      muted
                    />
                    <button
                      onClick={() => handleRemoveMedia(video.id, 'videos')}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center">
                        <Video className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onCameraCapture('photo')}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Take photo"
        >
          <Camera className="w-5 h-5" />
        </button>

        <button
          onClick={() => onCameraCapture('video')}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Record video"
        >
          <Video className="w-5 h-5" />
        </button>

        {/* File Upload Buttons */}
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'image')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Upload photo"
          />
          <div className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors">
            <Camera className="w-5 h-5" />
          </div>
        </div>

        <div className="relative">
          <input
            type="file"
            accept="video/*"
            onChange={(e) => handleFileUpload(e, 'video')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            title="Upload video"
          />
          <div className="p-2 text-gray-400 hover:text-success-600 hover:bg-success-50 rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  )
}