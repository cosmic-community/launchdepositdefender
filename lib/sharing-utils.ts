import { Report, ShareableReport } from '@/types'
import { dbManager } from '@/lib/db'

export class SharingManager {
  private static readonly SHARE_DOMAIN = typeof window !== 'undefined' ? window.location.origin : ''
  private static readonly SHARE_EXPIRY_DAYS = 7

  // Generate shareable link for report
  static async createShareableLink(report: Report): Promise<string> {
    try {
      const shareId = this.generateShareId()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + this.SHARE_EXPIRY_DAYS)

      const shareableReport: ShareableReport = {
        id: shareId,
        reportData: report,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        accessCount: 0
      }

      await dbManager.saveSharedReport(shareableReport)
      
      const shareUrl = `${this.SHARE_DOMAIN}/shared/${shareId}`
      return shareUrl
    } catch (error) {
      console.error('Failed to create shareable link:', error)
      throw new Error('Failed to create shareable link')
    }
  }

  // Retrieve shared report
  static async getSharedReport(shareId: string): Promise<ShareableReport | null> {
    try {
      const sharedReport = await dbManager.getSharedReport(shareId)
      
      if (!sharedReport) {
        return null
      }

      // Check if expired
      if (new Date(sharedReport.expiresAt) < new Date()) {
        await dbManager.cleanupExpiredShares()
        return null
      }

      // Increment access count
      sharedReport.accessCount += 1
      await dbManager.saveSharedReport(sharedReport)

      return sharedReport
    } catch (error) {
      console.error('Failed to retrieve shared report:', error)
      return null
    }
  }

  // Generate unique share ID
  private static generateShareId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 9)
    return `${timestamp}-${random}`
  }

  // Check if share is valid
  static async isShareValid(shareId: string): Promise<boolean> {
    try {
      const sharedReport = await dbManager.getSharedReport(shareId)
      
      if (!sharedReport) {
        return false
      }

      return new Date(sharedReport.expiresAt) >= new Date()
    } catch {
      return false
    }
  }

  // Revoke shared report
  static async revokeShare(shareId: string): Promise<void> {
    try {
      // We can't delete from IndexedDB directly, but we can set expiry to past
      const sharedReport = await dbManager.getSharedReport(shareId)
      
      if (sharedReport) {
        sharedReport.expiresAt = new Date(Date.now() - 1000).toISOString() // Set to 1 second ago
        await dbManager.saveSharedReport(sharedReport)
      }
    } catch (error) {
      console.error('Failed to revoke share:', error)
      throw new Error('Failed to revoke share')
    }
  }

  // Get share info without incrementing access count
  static async getShareInfo(shareId: string): Promise<{ valid: boolean; expiresAt?: string; accessCount?: number }> {
    try {
      const sharedReport = await dbManager.getSharedReport(shareId)
      
      if (!sharedReport) {
        return { valid: false }
      }

      const valid = new Date(sharedReport.expiresAt) >= new Date()
      
      return {
        valid,
        expiresAt: sharedReport.expiresAt,
        accessCount: sharedReport.accessCount
      }
    } catch {
      return { valid: false }
    }
  }

  // Cleanup expired shares
  static async cleanupExpiredShares(): Promise<number> {
    try {
      await dbManager.cleanupExpiredShares()
      return 0 // IndexedDB doesn't return count easily
    } catch (error) {
      console.error('Failed to cleanup expired shares:', error)
      return 0
    }
  }

  // Get sharing statistics
  static getShareDuration(): number {
    return this.SHARE_EXPIRY_DAYS
  }

  // Format share expiry for display
  static formatShareExpiry(expiresAt: string): string {
    const expiryDate = new Date(expiresAt)
    const now = new Date()
    const diffMs = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      return 'Expired'
    } else if (diffDays === 1) {
      return 'Expires in 1 day'
    } else {
      return `Expires in ${diffDays} days`
    }
  }

  // Copy to clipboard utility
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.opacity = '0'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      }
    } catch {
      return false
    }
  }
}

// Share button component data
export interface ShareOption {
  name: string
  icon: string
  url: (shareUrl: string, title: string) => string
  color: string
}

export const shareOptions: ShareOption[] = [
  {
    name: 'Copy Link',
    icon: 'Link',
    url: (shareUrl) => shareUrl,
    color: 'bg-gray-600'
  },
  {
    name: 'Email',
    icon: 'Mail',
    url: (shareUrl, title) => `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`View my move-out inspection report: ${shareUrl}`)}`,
    color: 'bg-blue-600'
  },
  {
    name: 'SMS',
    icon: 'MessageCircle',
    url: (shareUrl, title) => `sms:?body=${encodeURIComponent(`${title}: ${shareUrl}`)}`,
    color: 'bg-green-600'
  }
]