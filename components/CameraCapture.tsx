'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Camera, Video, RotateCcw, Download } from 'lucide-react'
import { MediaFile } from '@/types'

interface CameraCaptureProps {
  onCapture: (mediaFiles: MediaFile[]) => void
  onClose: () => void
  captureType: 'photo' | 'video'
  itemTitle: string
}

export function CameraCapture({ onCapture, onClose, captureType, itemTitle }: CameraCaptureProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [capturedMedia, setCapturedMedia] = useState<MediaFile[]>([])
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunks = useRef<Blob[]>([])

  useEffect(() => {
    startCamera()
    return () => {
      stopCamera()
    }
  }, [facingMode])

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: captureType === 'video'
      })
      
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setError('')
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please check permissions and try again.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }

  const capturePhoto = () => {
    if (!videoRef.current || !stream) return

    const canvas = document.createElement('canvas')
    const video = videoRef.current
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0)
    
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
        }
        reader.readAsDataURL(blob)
      }
    }, 'image/jpeg', 0.9)
  }

  const startVideoRecording = () => {
    if (!stream) return

    recordedChunks.current = []
    
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8,opus'
    })
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data)
      }
    }
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks.current, {
        type: 'video/webm'
      })
      
      const reader = new FileReader()
      reader.onload = () => {
        const mediaFile: MediaFile = {
          id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: `video-${Date.now()}.webm`,
          dataUrl: reader.result as string,
          type: 'video',
          size: blob.size,
          timestamp: new Date().toISOString(),
          watermarked: true
        }
        setCapturedMedia(prev => [...prev, mediaFile])
      }
      reader.readAsDataURL(blob)
    }
    
    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
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

  if (error) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg max-w-sm mx-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Camera Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={onClose} className="w-full btn-primary">
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-black/80 text-white p-4 flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-lg font-semibold truncate">{itemTitle}</h2>
          <p className="text-sm opacity-75">
            {captureType === 'photo' ? 'Take Photo' : 'Record Video'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
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
        
        {/* Camera Controls */}
        <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center space-x-4">
          <button
            onClick={toggleCamera}
            className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>

          {captureType === 'photo' ? (
            <button
              onClick={capturePhoto}
              className="p-4 bg-white rounded-full hover:bg-gray-100 transition-colors shadow-lg"
            >
              <Camera className="w-8 h-8 text-gray-900" />
            </button>
          ) : (
            <button
              onClick={isRecording ? stopVideoRecording : startVideoRecording}
              className={`p-4 rounded-full transition-colors shadow-lg ${
                isRecording
                  ? 'bg-danger-500 hover:bg-danger-600 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-900'
              }`}
            >
              <Video className="w-8 h-8" />
            </button>
          )}

          {capturedMedia.length > 0 && (
            <button
              onClick={handleSave}
              className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors"
            >
              <Download className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-danger-500 text-white px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording</span>
          </div>
        )}
      </div>

      {/* Captured Media Preview */}
      {capturedMedia.length > 0 && (
        <div className="bg-black/80 p-4">
          <div className="flex space-x-2 overflow-x-auto">
            {capturedMedia.map((media) => (
              <div key={media.id} className="relative flex-shrink-0">
                {media.type === 'image' ? (
                  <img
                    src={media.dataUrl}
                    alt="Captured"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    src={media.dataUrl}
                    className="w-16 h-16 object-cover rounded-lg"
                    muted
                  />
                )}
                <button
                  onClick={() => removeCapturedItem(media.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-white text-sm mt-2">
            {capturedMedia.length} item{capturedMedia.length !== 1 ? 's' : ''} captured
          </p>
        </div>
      )}
    </div>
  )
}