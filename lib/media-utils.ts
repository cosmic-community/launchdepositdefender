import { MediaFile } from '@/types'

export function compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Image compression failed'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => reject(new Error('Image loading failed'))
    img.src = URL.createObjectURL(file)
  })
}

export function addWatermark(canvas: HTMLCanvasElement, text: string): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Calculate font size based on canvas size
  const fontSize = Math.max(Math.min(canvas.width / 40, canvas.height / 40), 12)
  ctx.font = `${fontSize}px Arial, sans-serif`
  
  // Measure text to position it properly
  const textMetrics = ctx.measureText(text)
  const textWidth = textMetrics.width
  
  // Position watermark in bottom-right corner with padding
  const padding = 20
  const x = canvas.width - textWidth - padding
  const y = canvas.height - padding

  // Add semi-transparent background
  const backgroundHeight = fontSize + 10
  const backgroundWidth = textWidth + 16
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
  ctx.fillRect(x - 8, y - fontSize - 2, backgroundWidth, backgroundHeight)
  
  // Add text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.lineWidth = 1
  ctx.textAlign = 'left'
  ctx.textBaseline = 'bottom'
  
  // Draw outline for better visibility
  ctx.strokeText(text, x, y)
  ctx.fillText(text, x, y)
}

export function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0]?.match(/:(.*?);/)?.[1] || 'application/octet-stream'
  const bstr = atob(arr[1] || '')
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  
  return new Blob([u8arr], { type: mime })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function validateMediaFile(file: File, maxSize: number = 50 * 1024 * 1024): { valid: boolean; error?: string } {
  // Check file size (default 50MB)
  if (file.size > maxSize) {
    return { valid: false, error: `File size too large. Maximum size is ${formatFileSize(maxSize)}.` }
  }

  // Check file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg']
  
  if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Please upload an image (JPEG, PNG, WebP) or video (MP4, WebM, OGG).' }
  }

  return { valid: true }
}

export function createThumbnail(videoFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    video.onloadedmetadata = () => {
      // Seek to 1 second or 10% of the video, whichever is less
      const seekTime = Math.min(1, video.duration * 0.1)
      video.currentTime = seekTime
    }

    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      ctx.drawImage(video, 0, 0)
      
      const dataURL = canvas.toDataURL('image/jpeg', 0.8)
      resolve(dataURL)
      
      // Clean up
      URL.revokeObjectURL(video.src)
    }

    video.onerror = () => reject(new Error('Failed to load video for thumbnail'))
    
    video.src = URL.createObjectURL(videoFile)
    video.load()
  })
}

export function downloadMediaFile(mediaFile: MediaFile): void {
  const link = document.createElement('a')
  link.href = mediaFile.dataUrl
  link.download = mediaFile.filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function checkCameraSupport(): { hasCamera: boolean; hasMediaRecorder: boolean; supportedTypes: string[] } {
  const hasCamera = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  const hasMediaRecorder = typeof MediaRecorder !== 'undefined'
  
  const supportedTypes: string[] = []
  
  if (hasMediaRecorder) {
    const types = [
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9,opus',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4'
    ]
    
    types.forEach(type => {
      if (MediaRecorder.isTypeSupported(type)) {
        supportedTypes.push(type)
      }
    })
  }
  
  return {
    hasCamera,
    hasMediaRecorder,
    supportedTypes
  }
}