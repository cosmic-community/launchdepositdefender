'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Camera, Video, RotateCcw, Download, Play, Pause } from 'lucide-react'
import { MediaFile } from '@/types'
import { addWatermark } from '@/lib/media-utils'

interface CameraCaptureProps {
  onCapture: (mediaFiles: MediaFile[]) => void
  onClose: () => void
  captureType: 'photo' | 'video'
  itemTitle: string
}

export function CameraCapture({ onCapture, onClose, captureType, itemTitle }: CameraCaptureProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [capturedMedia, setCapturedMedia] = useState<MediaFile[]>([])
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  const [isCapturing, setIsCapturing] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])
  const recordingInterval = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 }
        },
        audio: captureType === 'video'
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Ensure video plays
        videoRef.current.play().catch(console.error)
      }
      setError('')
    } catch (err) {
      console.error('Camera access error:', err)
      let errorMessage = 'Unable to access camera. '
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage += 'Camera permission denied. Please allow camera access and try again.'
        } else if (err.name === 'NotFoundError') {
          errorMessage += 'No camera found on this device.'
        } else if (err.name === 'NotSupportedError') {
          errorMessage += 'Camera not supported in this browser.'
        } else {
          errorMessage += 'Please check permissions and try again.'
        }
      } else {
        errorMessage += 'Please check permissions and try again.'
      }
      
      setError(errorMessage)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop()
      })
      setStream(null)
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current || !stream || isCapturing) return

    setIsCapturing(true)

    try {
      const canvas = document.createElement('canvas')
      const video = videoRef.current
      
      // Wait for video to be ready
      if (video.readyState < 2) {
        await new Promise((resolve) => {
          video.addEventListener('loadeddata', resolve, { once: true })
        })
      }

      canvas.width = video.videoWidth || 1920
      canvas.height = video.videoHeight || 1080
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Canvas context not available')
      }

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Add watermark
      const watermarkText = `${itemTitle} - ${new Date().toLocaleDateString()}`
      addWatermark(canvas, watermarkText)
      
      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const reader = new FileReader()
          reader.onload = () => {
            const mediaFile: MediaFile = {
              id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              filename: `photo-${Date.now()}.jpg`,
              dataUrl: reader.result as string,
              type: 'image',
              size: blob.size,
              timestamp: new Date().toISOString(),
              watermarked: true
            }
            setCapturedMedia(prev => [...prev, mediaFile])
            setIsCapturing(false)
          }
          reader.onerror = () => {
            console.error('Failed to read captured image')
            setIsCapturing(false)
          }
          reader.readAsDataURL(blob)
        } else {
          console.error('Failed to create image blob')
          setIsCapturing(false)
        }
      }, 'image/jpeg', 0.9)
    } catch (err) {
      console.error('Photo capture error:', err)
      setIsCapturing(false)
    }
  }

  const startVideoRecording = () => {
    if (!stream || isRecording) return

    recordedChunks.current = []
    setRecordingTime(0)
    
    try {
      // Check for supported MIME types
      let mimeType = 'video/webm;codecs=vp8,opus'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4'
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: mimeType
        })
        
        const reader = new FileReader()
        reader.onload = () => {
          const extension = mimeType.includes('mp4') ? 'mp4' : 'webm'
          const mediaFile: MediaFile = {
            id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: `video-${Date.now()}.${extension}`,
            dataUrl: reader.result as string,
            type: 'video',
            size: blob.size,
            timestamp: new Date().toISOString(),
            watermarked: true
          }
          setCapturedMedia(prev => [...prev, mediaFile])
        }
        reader.readAsDataURL(blob)
        
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current)
        }
      }
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        setIsRecording(false)
        if (recordingInterval.current) {
          clearInterval(recordingInterval.current)
        }
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Capture data every second
      setIsRecording(true)

      // Start recording timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error('Failed to start recording:', err)
      setError('Unable to start video recording. Please try again.')
    }
  }

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current)
      }
    }
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const handleSave = () => {
    if (capturedMedia.length > 0) {
      onCapture(capturedMedia)
    }
  }

  const removeCapturedItem = (id: string) => {
    setCapturedMedia(prev => prev.filter(item => item.id !== id))
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex space-x-3">
            <button onClick={() => window.location.reload()} className="flex-1 btn-primary">
              Retry
            </button>
            <button onClick={onClose} className="flex-1 btn-secondary">
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
      <div className="bg-black/80 text-white p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{itemTitle}</h2>
          <p className="text-sm opacity-75">
            {captureType === 'photo' ? 'Take Photo' : 'Record Video'}
            {isRecording && ` • ${formatRecordingTime(recordingTime)}`}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 ml-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        
        {/* Camera Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center space-x-6 px-4">
          {/* Toggle Camera Button */}
          <button
            onClick={toggleCamera}
            disabled={isRecording}
            className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {/* Capture Button */}
          {captureType === 'photo' ? (
            <button
              onClick={capturePhoto}
              disabled={isCapturing || !stream}
              className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                isCapturing
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-white hover:bg-gray-100 hover:scale-105 active:scale-95'
              }`}
            >
              {isCapturing ? (
                <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-gray-900" />
              )}
            </button>
          ) : (
            <button
              onClick={isRecording ? stopVideoRecording : startVideoRecording}
              disabled={!stream}
              className={`p-4 rounded-full transition-all duration-200 shadow-lg ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 text-white hover:scale-105 active:scale-95'
                  : 'bg-white hover:bg-gray-100 text-gray-900 hover:scale-105 active:scale-95'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRecording ? (
                <div className="w-8 h-8 rounded bg-white" />
              ) : (
                <Video className="w-8 h-8" />
              )}
            </button>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={capturedMedia.length === 0}
            className={`p-3 rounded-full transition-colors shadow-lg ${
              capturedMedia.length > 0
                ? 'bg-primary-600 hover:bg-primary-700 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Download className="w-6 h-6" />
          </button>
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 text-white px-3 py-2 rounded-full shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">REC {formatRecordingTime(recordingTime)}</span>
          </div>
        )}

        {/* Camera Mode Indicator */}
        <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {facingMode === 'user' ? 'Front' : 'Back'} Camera
        </div>
      </div>

      {/* Captured Media Preview */}
      {capturedMedia.length > 0 && (
        <div className="bg-black/90 p-4 border-t border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white text-sm font-medium">
              {capturedMedia.length} item{capturedMedia.length !== 1 ? 's' : ''} captured
            </p>
            <button
              onClick={handleSave}
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              Save All
            </button>
          </div>
          
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {capturedMedia.map((media) => (
              <div key={media.id} className="relative flex-shrink-0">
                <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden">
                  {media.type === 'image' ? (
                    <img
                      src={media.dataUrl}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-700">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeCapturedItem(media.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors"
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