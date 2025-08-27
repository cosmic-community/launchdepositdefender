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

  const fontSize = Math.max(canvas.width / 40, 12)
  ctx.font = `${fontSize}px Arial`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
  ctx.lineWidth = 1

  const x = canvas.width - 20
  const y = canvas.height - 20

  ctx.textAlign = 'right'
  ctx.textBaseline = 'bottom'
  
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