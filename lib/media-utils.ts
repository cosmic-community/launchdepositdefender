import { MediaFile } from '@/types'

export class MediaProcessor {
  // Compress image with quality control
  static async compressImage(file: File, maxWidth = 1920, quality = 0.8): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Calculate dimensions maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
        const width = img.width * ratio
        const height = img.height * ratio

        canvas.width = width
        canvas.height = height

        if (!ctx) {
          resolve(file as any)
          return
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(dataUrl)
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // Add watermark with timestamp
  static async addWatermark(dataUrl: string, timestamp?: string): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        if (!ctx) {
          resolve(dataUrl)
          return
        }

        canvas.width = img.width
        canvas.height = img.height

        // Draw original image
        ctx.drawImage(img, 0, 0)

        // Add watermark
        const watermarkText = timestamp || new Date().toLocaleString()
        const fontSize = Math.max(16, Math.min(img.width / 25, 24))
        
        ctx.font = `${fontSize}px Arial`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.lineWidth = 2

        // Position watermark in bottom-right corner
        const padding = 10
        const textWidth = ctx.measureText(watermarkText).width
        const x = canvas.width - textWidth - padding
        const y = canvas.height - padding

        // Draw text with stroke for visibility
        ctx.strokeText(watermarkText, x, y)
        ctx.fillText(watermarkText, x, y)

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }

      img.src = dataUrl
    })
  }

  // Process captured media file
  static async processMediaFile(file: File, type: 'image' | 'video'): Promise<MediaFile> {
    const id = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const timestamp = new Date().toISOString()
    
    let dataUrl: string
    let watermarked = false

    if (type === 'image') {
      // Compress and watermark images
      const compressed = await this.compressImage(file)
      dataUrl = await this.addWatermark(compressed, new Date().toLocaleString())
      watermarked = true
    } else {
      // For videos, create data URL without processing (browser limitations)
      dataUrl = URL.createObjectURL(file)
      watermarked = false
    }

    return {
      id,
      filename: file.name || `${type}-${Date.now()}`,
      dataUrl,
      type,
      size: file.size,
      timestamp,
      watermarked
    }
  }

  // Get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Check if browser supports camera
  static async checkCameraSupport(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false
      }
      
      const devices = await navigator.mediaDevices.enumerateDevices()
      return devices.some(device => device.kind === 'videoinput')
    } catch {
      return false
    }
  }

  // Get optimal camera constraints
  static getCameraConstraints(facingMode: 'user' | 'environment' = 'environment') {
    return {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode
      },
      audio: false
    }
  }

  // Cleanup object URLs to prevent memory leaks
  static cleanupObjectUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }

  // Validate media file
  static validateMediaFile(file: File, type: 'image' | 'video'): { valid: boolean; error?: string } {
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024 // 10MB for images, 50MB for videos
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size too large. Maximum ${type === 'image' ? '10MB' : '50MB'} allowed.`
      }
    }

    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      : ['video/mp4', 'video/webm', 'video/quicktime']

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      }
    }

    return { valid: true }
  }
}

// Camera utilities
export class CameraManager {
  private stream: MediaStream | null = null
  private video: HTMLVideoElement | null = null

  async startCamera(videoElement: HTMLVideoElement, facingMode: 'user' | 'environment' = 'environment'): Promise<void> {
    try {
      this.video = videoElement
      const constraints = MediaProcessor.getCameraConstraints(facingMode)
      
      this.stream = await navigator.mediaDevices.getUserMedia(constraints)
      videoElement.srcObject = this.stream
      
      return new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => resolve()
        videoElement.onerror = reject
      })
    } catch (error) {
      throw new Error('Failed to access camera: ' + (error as Error).message)
    }
  }

  async capturePhoto(): Promise<string> {
    if (!this.video) {
      throw new Error('Camera not initialized')
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas not supported')
    }

    canvas.width = this.video.videoWidth
    canvas.height = this.video.videoHeight
    
    ctx.drawImage(this.video, 0, 0)
    return canvas.toDataURL('image/jpeg', 0.9)
  }

  stopCamera(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop())
      this.stream = null
    }
    
    if (this.video) {
      this.video.srcObject = null
      this.video = null
    }
  }

  async switchCamera(): Promise<void> {
    if (!this.video) return
    
    // Fix: Add optional chaining and explicit undefined check
    const currentTrack = this.stream?.getVideoTracks()[0]
    const currentFacingMode = currentTrack?.getSettings().facingMode
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user'
    
    this.stopCamera()
    await this.startCamera(this.video, newFacingMode)
  }
}