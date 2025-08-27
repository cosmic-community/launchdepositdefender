'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Camera, Video, RotateCcw, Check } from 'lucide-react'
import { CameraManager, MediaProcessor } from '@/lib/media-utils'

interface CameraCaptureProps {
  onCapture: (mediaFiles: any[]) => void
  onClose: () => void
  captureType: 'photo' | 'video'
  itemTitle: string
}

export function CameraCapture({ onCapture, onClose, captureType, itemTitle }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const cameraManager = useRef<CameraManager>(new CameraManager())
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [capturedMedia, setCapturedMedia] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
    initializeCamera()
    return () => {
      cameraManager.current.stopCamera()
    }
  }, [])

  const initializeCamera = async () => {
    try {
      const hasCamera = await MediaProcessor.checkCameraSupport()
      if (!hasCamera) {
        setError('No camera found on this device')
        return
      }

      if (videoRef.current) {
        await cameraManager.current.startCamera(videoRef.current)
        setIsInitialized(true)
      }
    } catch (error) {
      console.error('Camera initialization failed:', error)
      setError('Failed to access camera. Please check permissions.')
    }
  }

  const handleCapture = async () => {
    if (!isInitialized || isCapturing) return

    setIsCapturing(true)
    try {
      if (captureType === 'photo') {
        const dataUrl = await cameraManager.current.capturePhoto()
        const watermarkedUrl = await MediaProcessor.addWatermark(dataUrl)
        setCapturedMedia(prev => [...prev, watermarkedUrl])
      }
    } catch (error) {
      console.error('Capture failed:', error)
      setError('Failed to capture photo. Please try again.')
    } finally {
      setIsCapturing(false)
    }
  }

  const handleSwitchCamera = async () => {
    try {
      await cameraManager.current.switchCamera()
    } catch (error) {
      console.error('Failed to switch camera:', error)
      setError('Failed to switch camera')
    }
  }

  const handleRemoveCapture = (index: number) => {
    setCapturedMedia(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const mediaFiles = await Promise.all(
      capturedMedia.map(async (dataUrl, index) => ({
        id: `capture-${Date.now()}-${index}`,
        filename: `${captureType}-${Date.now()}-${index}`,
        dataUrl,
        type: captureType === 'photo' ? 'image' : 'video',
        size: 0, // We don't have file size for captured media
        timestamp: new Date().toISOString(),
        watermarked: true
      }))
    )

    onCapture(mediaFiles)
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-danger-100 text-danger-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{itemTitle}</h3>
          <p className="text-sm text-gray-300">
            Capture {captureType} • {capturedMedia.length} captured
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors ml-4"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {!isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-4" />
              <p>Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-6">
            {/* Switch Camera */}
            <button
              onClick={handleSwitchCamera}
              disabled={!isInitialized}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            {/* Capture Button */}
            <button
              onClick={handleCapture}
              disabled={!isInitialized || isCapturing}
              className={`w-16 h-16 bg-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
                isCapturing ? 'scale-95' : 'hover:scale-105'
              }`}
            >
              {isCapturing ? (
                <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full" />
              ) : (
                <Camera className="w-8 h-8 text-gray-900" />
              )}
            </button>

            {/* Captured Count */}
            <div className="w-12 h-12 bg-white/20 text-white rounded-full flex items-center justify-center">
              <span className="font-semibold">{capturedMedia.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Captured Media Preview */}
      {capturedMedia.length > 0 && (
        <div className="bg-black/80 p-4">
          <div className="flex items-center space-x-4 mb-4">
            <h4 className="text-white font-medium">Captured Media</h4>
            <button
              onClick={handleSubmit}
              className="btn-primary flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Use {capturedMedia.length} {captureType}{capturedMedia.length > 1 ? 's' : ''}</span>
            </button>
          </div>

          <div className="flex space-x-3 overflow-x-auto">
            {capturedMedia.map((mediaUrl, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={mediaUrl}
                  alt={`Captured ${captureType} ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-white/20"
                />
                <button
                  onClick={() => handleRemoveCapture(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}