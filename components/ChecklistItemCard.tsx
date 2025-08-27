'use client'

import { useState } from 'react'
import { ChecklistItem, SeverityLevel } from '@/types'
import { Camera, Video, FileText, Trash2, Check } from 'lucide-react'

interface ChecklistItemCardProps {
  item: ChecklistItem
  onUpdate: (item: ChecklistItem) => void
  onCameraCapture: (type: 'photo' | 'video') => void
}

export function ChecklistItemCard({ item, onUpdate, onCameraCapture }: ChecklistItemCardProps) {
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(item.notes || '')
  const [severity, setSeverity] = useState<SeverityLevel | undefined>(item.severity)

  const handleToggleComplete = () => {
    const updatedItem = {
      ...item,
      completed: !item.completed,
      severity: !item.completed && severity ? severity : undefined
    }
    onUpdate(updatedItem)
  }

  const handleSeverityChange = (newSeverity: SeverityLevel) => {
    setSeverity(newSeverity)
    const updatedItem = {
      ...item,
      severity: newSeverity,
      completed: true
    }
    onUpdate(updatedItem)
  }

  const handleNotesChange = () => {
    const updatedItem = {
      ...item,
      notes: notes.trim() || undefined
    }
    onUpdate(updatedItem)
    setShowNotes(false)
  }

  const handleRemoveMedia = (mediaId: string, type: 'photo' | 'video') => {
    const updatedItem = {
      ...item,
      photos: type === 'photo' ? item.photos.filter(p => p.id !== mediaId) : item.photos,
      videos: type === 'video' ? item.videos.filter(v => v.id !== mediaId) : item.videos
    }
    onUpdate(updatedItem)
  }

  return (
    <div className={`checklist-item ${item.completed ? 'completed' : 'incomplete'}`}>
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          item.completed
            ? 'bg-success-500 border-success-500 text-white'
            : 'border-gray-300 hover:border-primary-500'
        }`}
      >
        {item.completed && <Check className="w-3 h-3" />}
      </button>

      <div className="flex-1 min-w-0">
        {/* Item Text */}
        <p className={`text-sm font-medium ${item.completed ? 'text-success-800' : 'text-gray-900'}`}>
          {item.text}
        </p>

        {/* Severity Selection (when completed) */}
        {item.completed && (
          <div className="mt-2 flex flex-wrap gap-2">
            {(['minor', 'moderate', 'major'] as SeverityLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => handleSeverityChange(level)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  severity === level
                    ? `severity-${level}`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Media Preview */}
        {(item.photos.length > 0 || item.videos.length > 0) && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {item.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.dataUrl}
                    alt="Evidence"
                    className="media-thumbnail"
                  />
                  <button
                    onClick={() => handleRemoveMedia(photo.id, 'photo')}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
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
                    onClick={() => handleRemoveMedia(video.id, 'video')}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                    <Video className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {showNotes ? (
          <div className="mt-3 space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this item..."
              className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleNotesChange}
                className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700"
              >
                Save Notes
              </button>
              <button
                onClick={() => {
                  setNotes(item.notes || '')
                  setShowNotes(false)
                }}
                className="text-xs bg-gray-300 text-gray-700 px-3 py-1 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : item.notes && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {item.notes}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex-shrink-0 flex space-x-1">
        <button
          onClick={() => onCameraCapture('photo')}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Take Photo"
        >
          <Camera className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onCameraCapture('video')}
          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
          title="Record Video"
        >
          <Video className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => setShowNotes(!showNotes)}
          className={`p-2 rounded-lg transition-colors ${
            showNotes || item.notes
              ? 'text-primary-600 bg-primary-50'
              : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
          }`}
          title="Add Notes"
        >
          <FileText className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}