import jsPDF from 'jspdf'
import { Property, Report, ChecklistItem, SeverityLevel } from '@/types'

export class PDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  async generateReport(property: Property): Promise<Blob> {
    try {
      // Title page
      this.addTitlePage(property)
      
      // Property information
      this.addNewPage()
      this.addPropertyInfo(property)
      
      // Summary
      this.addSummarySection(property)
      
      // Room details
      for (const room of property.rooms) {
        this.addNewPage()
        await this.addRoomSection(room)
      }
      
      // Footer on all pages
      this.addFooterToAllPages(property)
      
      return new Blob([this.doc.output('blob')], { type: 'application/pdf' })
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error('Failed to generate PDF report')
    }
  }

  private addTitlePage(property: Property): void {
    // Header
    this.doc.setFontSize(24)
    this.doc.setTextColor(37, 99, 235) // Primary blue
    this.centeredText('DEPOSIT DEFENDER', this.currentY + 40)
    
    this.doc.setFontSize(18)
    this.doc.setTextColor(0, 0, 0)
    this.centeredText('Move-Out Inspection Report', this.currentY + 20)
    
    // Property address
    this.doc.setFontSize(14)
    this.doc.setTextColor(100, 100, 100)
    this.centeredText(property.address, this.currentY + 15)
    
    // Date
    this.doc.setFontSize(12)
    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    this.centeredText(`Generated on ${reportDate}`, this.currentY + 30)
    
    // Disclaimer box
    this.currentY += 50
    this.addDisclaimerBox()
    
    // Summary stats
    this.currentY += 40
    this.addSummaryStats(property)
  }

  private addPropertyInfo(property: Property): void {
    this.doc.setFontSize(16)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Property Information', this.margin, this.currentY)
    this.currentY += 15
    
    const info = [
      ['Property Address:', property.address],
      ['Tenant Name:', property.tenantName],
      ['Tenant Email:', property.tenantEmail || 'Not provided'],
      ['Move-Out Date:', new Date(property.moveOutDate).toLocaleDateString()],
      ['Report Generated:', new Date().toLocaleDateString()],
      ['Landlord Name:', property.landlordName || 'Not provided'],
      ['Landlord Email:', property.landlordEmail || 'Not provided'],
      ['Landlord Phone:', property.landlordPhone || 'Not provided']
    ]
    
    this.doc.setFontSize(10)
    info.forEach(([label, value]) => {
      this.doc.setTextColor(100, 100, 100)
      this.doc.text(label, this.margin, this.currentY)
      this.doc.setTextColor(0, 0, 0)
      // Fix: Ensure value is always a string and never undefined
      this.doc.text(value || 'Not provided', this.margin + 35, this.currentY)
      this.currentY += 6
    })
  }

  private addSummarySection(property: Property): void {
    this.currentY += 10
    this.doc.setFontSize(16)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Inspection Summary', this.margin, this.currentY)
    this.currentY += 15
    
    const totalItems = property.rooms.reduce((sum, room) => sum + room.totalItems, 0)
    const completedItems = property.rooms.reduce((sum, room) => sum + room.completedItems, 0)
    const issuesFound = property.rooms.reduce((sum, room) => 
      sum + room.items.filter(item => item.severity && item.completed).length, 0)
    
    // Summary table
    const summaryData = [
      ['Total Inspection Items:', totalItems.toString()],
      ['Items Completed:', completedItems.toString()],
      ['Issues Identified:', issuesFound.toString()],
      ['Rooms Inspected:', property.rooms.length.toString()],
      ['Overall Progress:', `${Math.round(property.overallProgress)}%`]
    ]
    
    this.doc.setFontSize(10)
    summaryData.forEach(([label, value]) => {
      this.doc.setTextColor(100, 100, 100)
      this.doc.text(label, this.margin, this.currentY)
      this.doc.setTextColor(0, 0, 0)
      // Fix: Ensure value is always a string and never undefined
      this.doc.text(value || '0', this.margin + 40, this.currentY)
      this.currentY += 6
    })
    
    // Issues by severity
    if (issuesFound > 0) {
      this.currentY += 10
      this.addIssuesSummary(property)
    }
  }

  private addIssuesSummary(property: Property): void {
    this.doc.setFontSize(14)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text('Issues by Severity', this.margin, this.currentY)
    this.currentY += 10
    
    const severityCounts = { minor: 0, moderate: 0, major: 0 }
    
    property.rooms.forEach(room => {
      room.items.forEach(item => {
        if (item.severity && item.completed) {
          severityCounts[item.severity]++
        }
      })
    })
    
    const severityColors = {
      minor: [34, 197, 94],   // Green
      moderate: [245, 158, 11], // Yellow
      major: [239, 68, 68]    // Red
    }
    
    Object.entries(severityCounts).forEach(([severity, count]) => {
      if (count > 0) {
        const color = severityColors[severity as SeverityLevel]
        this.doc.setTextColor(color[0], color[1], color[2])
        this.doc.text(`● ${severity.charAt(0).toUpperCase() + severity.slice(1)}: ${count}`, this.margin, this.currentY)
        this.currentY += 6
      }
    })
  }

  private async addRoomSection(room: any): Promise<void> {
    // Room header
    this.doc.setFontSize(18)
    this.doc.setTextColor(37, 99, 235)
    this.doc.text(room.name, this.margin, this.currentY)
    this.currentY += 15
    
    // Room progress
    this.doc.setFontSize(10)
    this.doc.setTextColor(100, 100, 100)
    // Fix: Add explicit undefined checks and default to 0
    const progressPercentage = room.progressPercentage ?? 0
    const completedItems = room.completedItems ?? 0
    const totalItems = room.totalItems ?? 0
    this.doc.text(`Progress: ${Math.round(progressPercentage)}% (${completedItems}/${totalItems})`, this.margin, this.currentY)
    this.currentY += 10
    
    // Group items by category
    const categories = this.groupItemsByCategory(room.items)
    
    for (const [category, items] of Object.entries(categories)) {
      await this.addCategorySection(category, items)
    }
  }

  private groupItemsByCategory(items: ChecklistItem[]): Record<string, ChecklistItem[]> {
    return items.reduce((groups, item) => {
      const category = item.category || 'General'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    }, {} as Record<string, ChecklistItem[]>)
  }

  private async addCategorySection(category: string, items: ChecklistItem[]): Promise<void> {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      this.addNewPage()
    }
    
    // Category header
    this.doc.setFontSize(12)
    this.doc.setTextColor(0, 0, 0)
    this.doc.text(category, this.margin, this.currentY)
    this.currentY += 8
    
    // Items
    for (const item of items) {
      await this.addItemSection(item)
    }
    
    this.currentY += 5
  }

  private async addItemSection(item: ChecklistItem): Promise<void> {
    const startY = this.currentY
    const itemHeight = this.calculateItemHeight(item)
    
    // Check if we need a new page
    if (this.currentY + itemHeight > this.pageHeight - this.margin) {
      this.addNewPage()
    }
    
    // Item status icon
    const statusIcon = item.completed ? '✓' : '○'
    const statusColor = item.completed ? [34, 197, 94] : [156, 163, 175]
    
    this.doc.setFontSize(10)
    this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
    this.doc.text(statusIcon, this.margin, this.currentY)
    
    // Item text
    this.doc.setTextColor(0, 0, 0)
    const itemText = this.doc.splitTextToSize(item.text, this.pageWidth - this.margin * 2 - 30)
    this.doc.text(itemText, this.margin + 8, this.currentY)
    this.currentY += itemText.length * 4
    
    // Severity tag
    if (item.severity && item.completed) {
      this.addSeverityTag(item.severity)
    }
    
    // Notes
    if (item.notes && item.notes.trim()) {
      this.currentY += 2
      this.doc.setTextColor(100, 100, 100)
      this.doc.setFontSize(8)
      const notesText = this.doc.splitTextToSize(`Notes: ${item.notes}`, this.pageWidth - this.margin * 2 - 10)
      this.doc.text(notesText, this.margin + 10, this.currentY)
      this.currentY += notesText.length * 3
    }
    
    // Photos
    if (item.photos.length > 0) {
      this.currentY += 3
      await this.addPhotosSection(item.photos)
    }
    
    this.currentY += 8
  }

  private addSeverityTag(severity: SeverityLevel): void {
    const severityConfig = {
      minor: { color: [34, 197, 94], text: 'MINOR' },
      moderate: { color: [245, 158, 11], text: 'MODERATE' },
      major: { color: [239, 68, 68], text: 'MAJOR' }
    }
    
    const config = severityConfig[severity]
    this.doc.setFontSize(7)
    this.doc.setTextColor(config.color[0], config.color[1], config.color[2])
    this.doc.text(`[${config.text}]`, this.margin + 10, this.currentY + 3)
  }

  private async addPhotosSection(photos: any[]): Promise<void> {
    const photoSize = 40
    const photosPerRow = Math.floor((this.pageWidth - this.margin * 2) / (photoSize + 5))
    
    for (let i = 0; i < photos.length; i += photosPerRow) {
      if (this.currentY + photoSize > this.pageHeight - this.margin) {
        this.addNewPage()
      }
      
      const rowPhotos = photos.slice(i, i + photosPerRow)
      
      for (let j = 0; j < rowPhotos.length; j++) {
        const photo = rowPhotos[j]
        const x = this.margin + 10 + j * (photoSize + 5)
        
        try {
          // Add photo to PDF
          this.doc.addImage(photo.dataUrl, 'JPEG', x, this.currentY, photoSize, photoSize)
          
          // Add timestamp below photo
          this.doc.setFontSize(6)
          this.doc.setTextColor(100, 100, 100)
          const timestamp = new Date(photo.timestamp).toLocaleString()
          this.doc.text(timestamp, x, this.currentY + photoSize + 3)
        } catch (error) {
          console.error('Failed to add photo to PDF:', error)
          // Add placeholder for failed photo
          this.doc.setDrawColor(200, 200, 200)
          this.doc.rect(x, this.currentY, photoSize, photoSize)
          this.doc.setFontSize(8)
          this.doc.setTextColor(150, 150, 150)
          this.doc.text('Photo\nUnavailable', x + photoSize/2, this.currentY + photoSize/2, { align: 'center' })
        }
      }
      
      this.currentY += photoSize + 8
    }
  }

  private calculateItemHeight(item: ChecklistItem): number {
    let height = 12 // Base item height
    
    if (item.notes && item.notes.trim()) {
      height += 15
    }
    
    if (item.photos.length > 0) {
      const photoRows = Math.ceil(item.photos.length / 3)
      height += photoRows * 45
    }
    
    return height
  }

  private addDisclaimerBox(): void {
    const boxHeight = 40
    const boxY = this.currentY
    
    // Draw box
    this.doc.setDrawColor(200, 200, 200)
    this.doc.setFillColor(250, 250, 250)
    this.doc.roundedRect(this.margin, boxY, this.pageWidth - this.margin * 2, boxHeight, 3, 3, 'FD')
    
    // Add disclaimer text
    this.doc.setFontSize(9)
    this.doc.setTextColor(100, 100, 100)
    const disclaimerText = [
      'This report was generated using DepositDefender, a privacy-first documentation tool.',
      'All photos include timestamps and watermarks for authenticity verification.',
      'This report is intended for reference purposes in deposit recovery processes.'
    ]
    
    let textY = boxY + 8
    disclaimerText.forEach(line => {
      this.centeredText(line, textY)
      textY += 6
    })
    
    this.currentY += boxHeight
  }

  private addSummaryStats(property: Property): void {
    const stats = [
      { label: 'Rooms', value: property.rooms.length.toString() },
      { label: 'Items', value: property.rooms.reduce((sum, room) => sum + room.totalItems, 0).toString() },
      { label: 'Progress', value: `${Math.round(property.overallProgress)}%` }
    ]
    
    const boxWidth = (this.pageWidth - this.margin * 2 - 20) / 3
    
    stats.forEach((stat, index) => {
      const x = this.margin + index * (boxWidth + 10)
      
      // Stat box
      this.doc.setFillColor(240, 240, 240)
      this.doc.roundedRect(x, this.currentY, boxWidth, 25, 3, 3, 'F')
      
      // Value
      this.doc.setFontSize(16)
      this.doc.setTextColor(37, 99, 235)
      // Fix: Add explicit alignment object for text method
      this.doc.text(stat.value, x + boxWidth/2, this.currentY + 12, { align: 'center' } as any)
      
      // Label
      this.doc.setFontSize(8)
      this.doc.setTextColor(100, 100, 100)
      // Fix: Add explicit alignment object for text method
      this.doc.text(stat.label, x + boxWidth/2, this.currentY + 20, { align: 'center' } as any)
    })
  }

  private addNewPage(): void {
    this.doc.addPage()
    this.currentY = this.margin
  }

  private centeredText(text: string, y: number): void {
    const textWidth = this.doc.getTextWidth(text)
    const x = (this.pageWidth - textWidth) / 2
    this.doc.text(text, x, y)
  }

  private addFooterToAllPages(property: Property): void {
    const totalPages = this.doc.getNumberOfPages()
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i)
      
      // Footer line
      this.doc.setDrawColor(220, 220, 220)
      this.doc.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15)
      
      // Footer text
      this.doc.setFontSize(8)
      this.doc.setTextColor(100, 100, 100)
      this.doc.text('DepositDefender Report', this.margin, this.pageHeight - 8)
      // Fix: Add explicit alignment object for text method
      this.doc.text(property.address, this.pageWidth / 2, this.pageHeight - 8, { align: 'center' } as any)
      this.doc.text(`Page ${i} of ${totalPages}`, this.pageWidth - this.margin, this.pageHeight - 8, { align: 'right' } as any)
    }
  }
}

export async function generatePropertyReport(property: Property): Promise<Blob> {
  const generator = new PDFGenerator()
  return await generator.generateReport(property)
}