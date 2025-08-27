'use client'

import { useState } from 'react'
import { Check, Camera, Video, FileText, AlertTriangle, AlertCircle, X, Play, Download } from 'lucide-react'
import { ChecklistItem, SeverityLevel, MediaFile } from '@/types'
import { formatFileSize, downloadMediaFile } from '@/lib/media-utils'

interface ChecklistItemCardProps {
  item: ChecklistItem
  onUpdate: (updatedItem: ChecklistItem) => void
  onCameraCapture: (type: 'photo' | 'video') => void
}

export function ChecklistItemCard({ item, onUpdate, onCameraCapture }: ChecklistItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [notes, setNotes] = useState(item.notes || '')
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | undefined>(item.severity)

  const handleToggleComplete = () => {
    onUpdate({
      ...item,
      completed: !item.completed
    })
  }

  const handleNotesUpdate = () => {
    if (notes.trim() !== (item.notes || '')) {
      onUpdate({
        ...item,
        notes: notes.trim()
      })
    }
  }

  const handleSeverityChange = (severity: SeverityLevel | undefined) => {
    setSelectedSeverity(severity)
    onUpdate({
      ...item,
      severity
    })
  }

  const removeMediaFile = (mediaId: string, type: 'photos' | 'videos') => {
    onUpdate({
      ...item,
      [type]: item[type].filter(media => media.id !== mediaId)
    })
  }

  const getSeverityIcon = (severity: SeverityLevel) => {
    switch (severity) {
      case 'minor':
        return <AlertCircle className="w-4 h-4" />
      case 'moderate':
        return <AlertTriangle className="w-4 h-4" />
      case 'major':
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: SeverityLevel) => {
    switch (severity) {
      case 'minor':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300'
      case 'moderate':
        return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'major':
        return 'text-red-600 bg-red-100 border-red-300'
      default:
        return ''
    }
  }

  const totalMedia = item.photos.length + item.videos.length

  return (
    <div className={`card transition-all duration-200 ${
      item.completed ? 'bg-success-50 border-success-200' : 'bg-white border-gray-200'
    } ${item.severity ? 'ring-1 ' + getSeverityColor(item.severity).split(' ')[2].replace('border-', 'ring-') : ''}`}>
      {/* Main Content */}
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
            item.completed
              ? 'bg-success-500 border-success-500 text-white'
              : 'border-gray-300 hover:border-primary-400 bg-white'
          }`}
        >
          {item.completed && <Check className="w-4 h-4" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className={`text-base font-medium ${
                item.completed ? 'text-success-800 line-through' : 'text-gray-900'
              }`}>
                {item.text}
              </p>
              
              {item.category && (
                <p className="text-sm text-gray-500 mt-1">
                  {item.category}
                </p>
              )}

              {/* Severity Badge */}
              {item.severity && (
                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border mt-2 ${getSeverityColor(item.severity)}`}>
                  {getSeverityIcon(item.severity)}
                  <span className="capitalize">{item.severity}</span>
                </div>
              )}

              {/* Media Count */}
              {totalMedia > 0 && (
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  {item.photos.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Camera className="w-4 h-4" />
                      <span>{item.photos.length}</span>
                    </div>
                  )}
                  {item.videos.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Video className="w-4 h-4" />
                      <span>{item.videos.length}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Notes Preview */}
              {item.notes && !isExpanded && (
                <p className="text-sm text-gray-600 mt-2 truncate">
                  {item.notes}
                </p>
              )}
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-2 mt-3">
            <button
              onClick={() => onCameraCapture('photo')}
              className="btn-sm flex items-center space-x-1 bg-primary-100 text-primary-700 hover:bg-primary-200"
            >
              <Camera className="w-4 h-4" />
              <span>Photo</span>
            </button>
            
            <button
              onClick={() => onCameraCapture('video')}
              className="btn-sm flex items-center space-x-1 bg-purple-100 text-purple-700 hover:bg-purple-200"
            >
              <Video className="w-4 h-4" />
              <span>Video</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          {/* Severity Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Issue Severity
            </label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleSeverityChange(undefined)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  !selectedSeverity
                    ? 'bg-gray-100 border-gray-300 text-gray-700'
                    : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                None
              </button>
              {(['minor', 'moderate', 'major'] as SeverityLevel[]).map((severity) => (
                <button
                  key={severity}
                  onClick={() => handleSeverityChange(severity)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors capitalize ${
                    selectedSeverity === severity
                      ? getSeverityColor(severity)
                      : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {severity}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleNotesUpdate}
              placeholder="Add notes about this item..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Media Gallery */}
          {totalMedia > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Attached Media ({totalMedia})
              </h4>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {/* Photos */}
                {item.photos.map((photo) => (
                  <MediaThumbnail
                    key={photo.id}
                    media={photo}
                    onRemove={() => removeMediaFile(photo.id, 'photos')}
                  />
                ))}
                
                {/* Videos */}
                {item.videos.map((video) => (
                  <MediaThumbnail
                    key={video.id}
                    media={video}
                    onRemove={() => removeMediaFile(video.id, 'videos')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={() => onCameraCapture('photo')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Take Photo</span>
              </button>
              
              <button
                onClick={() => onCameraCapture('video')}
                className="btn-secondary flex items-center space-x-2"
              >
                <Video className="w-4 h-4" />
                <span>Record Video</span>
              </button>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 font-medium text-sm"
            >
              Collapse
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaThumbnail({ media, onRemove }: { media: MediaFile; onRemove: () => void }) {
  const [showPreview, setShowPreview] = useState(false)

  return (
    <>
      <div className="relative group">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          {media.type === 'image' ? (
            <img
              src={media.dataUrl}
              alt="Captured media"
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowPreview(true)}
            />
          ) : (
            <div
              className="w-full h-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => setShowPreview(true)}
            >
              <Play className="w-8 h-8 text-white" />
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <button
              onClick={() => downloadMediaFile(media)}
              className="p-1 bg-black/50 hover:bg-black/70 text-white rounded"
              title="Download"
            >
              <Download className="w-3 h-3" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 bg-black/50 hover:bg-black/70 text-white rounded"
              title="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* File Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
          <div className="truncate">{media.filename}</div>
          <div>{formatFileSize(media.size)}</div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
            >
              <X className="w-6 h-6" />
            </button>
            
            {media.type === 'image' ? (
              <img
                src={media.dataUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <video
                src={media.dataUrl}
                controls
                className="max-w-full max-h-full"
                autoPlay
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}