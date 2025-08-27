'use client'

import { useState } from 'react'
import { ChecklistItem, SeverityLevel } from '@/types'
import { Camera, Video, FileText, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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
    <Card className={`transition-all duration-200 ${item.completed ? 'bg-success-50/50 border-success-200' : 'hover:bg-gray-50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Checkbox */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleComplete}
            className={`h-5 w-5 p-0 rounded border-2 flex-shrink-0 ${
              item.completed
                ? 'bg-success-500 border-success-500 text-white hover:bg-success-600'
                : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
            }`}
          >
            {item.completed && <Check className="w-3 h-3" />}
          </Button>

          <div className="flex-1 min-w-0">
            {/* Item Text */}
            <p className={`text-sm font-medium ${item.completed ? 'text-success-800' : 'text-gray-900'}`}>
              {item.text}
            </p>

            {/* Severity Selection */}
            {item.completed && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(['minor', 'moderate', 'major'] as SeverityLevel[]).map((level) => (
                  <Button
                    key={level}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSeverityChange(level)}
                    className={`h-7 px-3 text-xs ${
                      severity === level
                        ? ''
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Badge variant={severity === level ? level : 'outline'} className="pointer-events-none">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Badge>
                  </Button>
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
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveMedia(photo.id, 'photo')}
                        className="absolute -top-1 -right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {item.videos.map((video) => (
                    <div key={video.id} className="relative group">
                      <video
                        src={video.dataUrl}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        muted
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveMedia(video.id, 'video')}
                        className="absolute -top-1 -right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded flex items-center">
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
                  className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={handleNotesChange}>
                    Save Notes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setNotes(item.notes || '')
                      setShowNotes(false)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : item.notes && (
              <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border">
                {item.notes}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex-shrink-0 flex space-x-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCameraCapture('photo')}
              className="h-8 w-8 text-gray-400 hover:text-primary-600 hover:bg-primary-50"
            >
              <Camera className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCameraCapture('video')}
              className="h-8 w-8 text-gray-400 hover:text-primary-600 hover:bg-primary-50"
            >
              <Video className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotes(!showNotes)}
              className={`h-8 w-8 ${
                showNotes || item.notes
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              <FileText className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}