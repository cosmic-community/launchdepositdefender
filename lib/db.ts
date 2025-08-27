import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { DatabaseSchema, Property, Report, ShareableReport } from '@/types'

interface DepositDefenderDB extends DBSchema {
  properties: {
    key: string
    value: Property
    indexes: { 'by-created': string }
  }
  reports: {
    key: string
    value: Report
    indexes: { 'by-property': string, 'by-generated': string }
  }
  sharedReports: {
    key: string
    value: ShareableReport
    indexes: { 'by-expires': string }
  }
}

class DatabaseManager {
  private db: IDBPDatabase<DepositDefenderDB> | null = null
  private readonly DB_NAME = 'DepositDefenderDB'
  private readonly DB_VERSION = 1

  async init(): Promise<void> {
    if (this.db) return

    this.db = await openDB<DepositDefenderDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Properties store
        const propertyStore = db.createObjectStore('properties', {
          keyPath: 'id'
        })
        propertyStore.createIndex('by-created', 'createdAt')

        // Reports store
        const reportStore = db.createObjectStore('reports', {
          keyPath: 'id'
        })
        reportStore.createIndex('by-property', 'propertyId')
        reportStore.createIndex('by-generated', 'generatedAt')

        // Shared reports store
        const sharedStore = db.createObjectStore('sharedReports', {
          keyPath: 'id'
        })
        sharedStore.createIndex('by-expires', 'expiresAt')
      }
    })
  }

  // Property operations
  async saveProperty(property: Property): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('properties', property)
  }

  async getProperty(id: string): Promise<Property | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.get('properties', id)
  }

  async getAllProperties(): Promise<Property[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.getAll('properties')
  }

  async deleteProperty(id: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    // Delete property and associated reports
    await this.db.delete('properties', id)
    
    const reports = await this.db.getAllFromIndex('reports', 'by-property', id)
    for (const report of reports) {
      await this.db.delete('reports', report.id)
    }
  }

  // Report operations
  async saveReport(report: Report): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('reports', report)
  }

  async getReport(id: string): Promise<Report | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.get('reports', id)
  }

  async getReportsByProperty(propertyId: string): Promise<Report[]> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.getAllFromIndex('reports', 'by-property', propertyId)
  }

  async deleteReport(id: string): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.delete('reports', id)
  }

  // Shared report operations
  async saveSharedReport(sharedReport: ShareableReport): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.put('sharedReports', sharedReport)
  }

  async getSharedReport(id: string): Promise<ShareableReport | undefined> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    return await this.db.get('sharedReports', id)
  }

  async cleanupExpiredShares(): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    const now = new Date().toISOString()
    const expired = await this.db.getAllFromIndex('sharedReports', 'by-expires', IDBKeyRange.upperBound(now))
    
    for (const share of expired) {
      await this.db.delete('sharedReports', share.id)
    }
  }

  // Storage quota information
  async getStorageInfo(): Promise<{ usage: number; quota: number; percentUsed: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 0
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0
      
      return { usage, quota, percentUsed }
    }
    
    return { usage: 0, quota: 0, percentUsed: 0 }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    await this.init()
    if (!this.db) throw new Error('Database not initialized')
    
    await this.db.clear('properties')
    await this.db.clear('reports')
    await this.db.clear('sharedReports')
  }
}

// Singleton instance
export const dbManager = new DatabaseManager()

// Utility functions
export async function ensureDB(): Promise<void> {
  await dbManager.init()
}

export async function getStorageQuota() {
  return await dbManager.getStorageInfo()
}

export async function cleanupExpiredData() {
  await dbManager.cleanupExpiredShares()
}