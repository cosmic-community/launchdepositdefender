import jsPDF from 'jspdf'
import { Property, PDFOptions } from '@/types'

export async function generatePDF(property: Property, options: PDFOptions): Promise<Blob> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  
  let yPosition = margin

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage()
      yPosition = margin
    }
  }

  // Header
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Property Inspection Report', margin, yPosition)
  yPosition += 15

  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPosition)
  yPosition += 10

  // Property Information
  checkPageBreak(40)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Property Information', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Address: ${property.address}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Tenant: ${property.tenantName}`, margin, yPosition)
  yPosition += 6
  
  // Safe date handling with fallback
  const moveOutDate = property.moveOutDate ? new Date(property.moveOutDate).toLocaleDateString() : 'Not specified'
  pdf.text(`Move-out Date: ${moveOutDate}`, margin, yPosition)
  yPosition += 6

  if (property.landlordName) {
    pdf.text(`Landlord: ${property.landlordName}`, margin, yPosition)
    yPosition += 6
  }

  yPosition += 10

  // Summary Statistics
  checkPageBreak(30)
  const totalItems = property.rooms.reduce((sum, room) => sum + room.totalItems, 0)
  const completedItems = property.rooms.reduce((sum, room) => sum + room.completedItems, 0)
  const issuesFound = property.rooms.reduce((sum, room) => 
    sum + room.items.filter(item => item.severity && item.completed).length, 0)

  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text('Inspection Summary', margin, yPosition)
  yPosition += 10

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Total Items Inspected: ${completedItems}/${totalItems}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Issues Identified: ${issuesFound}`, margin, yPosition)
  yPosition += 6
  pdf.text(`Overall Progress: ${Math.round(property.overallProgress)}%`, margin, yPosition)
  yPosition += 15

  // Room Details
  for (const room of property.rooms) {
    checkPageBreak(50)
    
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${room.name}`, margin, yPosition)
    yPosition += 8

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Progress: ${room.completedItems}/${room.totalItems} items (${Math.round(room.progressPercentage)}%)`, margin, yPosition)
    yPosition += 8

    // Group items by category
    const itemsByCategory = room.items.reduce((acc, item) => {
      const category = item.category || 'General'
      if (!acc[category]) acc[category] = []
      acc[category].push(item)
      return acc
    }, {} as Record<string, typeof room.items>)

    for (const [category, items] of Object.entries(itemsByCategory)) {
      checkPageBreak(30)
      
      pdf.setFont('helvetica', 'bold')
      pdf.text(`  ${category}`, margin + 5, yPosition)
      yPosition += 6

      pdf.setFont('helvetica', 'normal')
      for (const item of items) {
        checkPageBreak(15)
        
        const status = item.completed ? '✓' : '○'
        const severityText = item.severity ? ` [${item.severity.toUpperCase()}]` : ''
        
        pdf.text(`    ${status} ${item.text}${severityText}`, margin + 10, yPosition)
        yPosition += 5

        if (options.includeNotes && item.notes) {
          pdf.setFont('helvetica', 'italic')
          const noteLines = pdf.splitTextToSize(`      Note: ${item.notes}`, contentWidth - 15)
          for (const line of noteLines) {
            checkPageBreak(5)
            pdf.text(line, margin + 15, yPosition)
            yPosition += 4
          }
          pdf.setFont('helvetica', 'normal')
        }

        if (options.includePhotos && item.photos.length > 0) {
          yPosition += 2
          pdf.setFont('helvetica', 'italic')
          pdf.text(`      Photos: ${item.photos.length} attached`, margin + 15, yPosition)
          pdf.setFont('helvetica', 'normal')
          yPosition += 4
        }
      }
      yPosition += 5
    }
    yPosition += 10
  }

  // Footer
  const totalPages = pdf.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(
      `DepositDefender Report - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    )
    pdf.text(
      `Generated on ${new Date().toLocaleString()}`,
      pageWidth - margin,
      pageHeight - 10,
      { align: 'right' }
    )
  }

  return pdf.output('blob')
}