export type SeverityLevel = 'minor' | 'moderate' | 'major'

export interface ChecklistItem {
  id: string
  text: string
  category: string
  completed: boolean
  severity?: SeverityLevel
  notes?: string
  photos: MediaFile[]
  videos: MediaFile[]
}

export interface MediaFile {
  id: string
  filename: string
  dataUrl: string
  type: 'image' | 'video'
  size: number
  timestamp: string
  watermarked: boolean
}

export interface Room {
  id: string
  name: string
  type: RoomType
  items: ChecklistItem[]
  completedItems: number
  totalItems: number
  progressPercentage: number
  lastModified: string
}

export type RoomType = 'kitchen' | 'bathroom' | 'bedroom' | 'living-room' | 'general'

export interface Property {
  id: string
  address: string
  landlordName?: string
  landlordEmail?: string
  landlordPhone?: string
  tenantName: string
  tenantEmail?: string
  moveOutDate: string
  createdAt: string
  rooms: Room[]
  overallProgress: number
}

export interface Report {
  id: string
  propertyId: string
  generatedAt: string
  pdfBlob?: Blob
  shareLink?: string
  shareExpiration?: string
  property: Property
}

export interface ShareableReport {
  id: string
  reportData: Report
  createdAt: string
  expiresAt: string
  accessCount: number
}

export interface DatabaseSchema {
  properties: Property
  reports: Report
  sharedReports: ShareableReport
}

// Room template definitions
export interface RoomTemplate {
  type: RoomType
  displayName: string
  icon: string
  items: Omit<ChecklistItem, 'id' | 'completed' | 'photos' | 'videos'>[]
}

// PDF generation types
export interface PDFOptions {
  includePhotos: boolean
  includeNotes: boolean
  watermarkImages: boolean
}

// PWA types
export interface InstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

// Form types
export interface PropertyFormData {
  address: string
  landlordName: string
  landlordEmail: string
  landlordPhone: string
  tenantName: string
  tenantEmail: string
  moveOutDate: string
}

// Storage types
export interface StorageQuota {
  usage: number
  quota: number
  percentUsed: number
}

// Camera/Media types
export interface CameraConstraints {
  video: {
    width: { ideal: number }
    height: { ideal: number }
    facingMode: string
  }
  audio: boolean
}

// Notification types
export interface AppNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}