'use client'

import { useState, useEffect } from 'react'
import { SharingManager } from '@/lib/sharing-utils'
import { ShareableReport } from '@/types'
import { FileText, Download, Eye, Clock, Shield, AlertCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface SharedReportViewProps {
  shareId: string
}

export function SharedReportView({ shareId }: SharedReportViewProps) {
  const [report, setReport] = useState<ShareableReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSharedReport()
  }, [shareId])

  const loadSharedReport = async () => {
    try {
      const sharedReport = await SharingManager.getSharedReport(shareId)
      
      if (!sharedReport) {
        setError('Report not found or has expired')
      } else {
        setReport(sharedReport)
      }
    } catch (error) {
      console.error('Failed to load shared report:', error)
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async () => {
    if (!report?.reportData.pdfBlob) return

    const url = URL.createObjectURL(report.reportData.pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DepositDefender-Report-${report.reportData.property.address.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const previewReport = () => {
    if (!report?.reportData.pdfBlob) return

    const url = URL.createObjectURL(report.reportData.pdfBlob)
    window.open(url, '_blank')
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-danger-100 text-danger-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Available</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This report link has expired or is invalid.'}
          </p>
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <p>Shared reports expire after 7 days for security purposes.</p>
          </div>
        </div>
      </div>
    )
  }

  const { reportData } = report
  const property = reportData.property
  
  const stats = {
    totalItems: property.rooms.reduce((sum, room) => sum + room.totalItems, 0),
    completedItems: property.rooms.reduce((sum, room) => sum + room.completedItems, 0),
    issuesFound: property.rooms.reduce((sum, room) => 
      sum + room.items.filter(item => item.severity && item.completed).length, 0),
    totalPhotos: property.rooms.reduce((sum, room) => 
      sum + room.items.reduce((photoSum, item) => photoSum + item.photos.length, 0), 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 text-white rounded-full mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              DepositDefender Report
            </h1>
            <p className="text-gray-600">
              Shared inspection report • Accessed {report.accessCount} time{report.accessCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {/* Property Information */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {property.address}
            </h2>
            <p className="text-gray-600">
              Move-out Date: {formatDate(property.moveOutDate)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">
                {Math.round(property.overallProgress)}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600 mb-1">
                {stats.completedItems}
              </div>
              <div className="text-sm text-gray-600">Items Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600 mb-1">
                {stats.issuesFound}
              </div>
              <div className="text-sm text-gray-600">Issues Found</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 mb-1">
                {stats.totalPhotos}
              </div>
              <div className="text-sm text-gray-600">Photos Taken</div>
            </div>
          </div>

          {/* Property Details */}
          <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Tenant Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{property.tenantName}</span>
                </div>
                {property.tenantEmail && (
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2">{property.tenantEmail}</span>
                  </div>
                )}
              </div>
            </div>
            
            {(property.landlordName || property.landlordEmail || property.landlordPhone) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Landlord Information</h3>
                <div className="space-y-2 text-sm">
                  {property.landlordName && (
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{property.landlordName}</span>
                    </div>
                  )}
                  {property.landlordEmail && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2">{property.landlordEmail}</span>
                    </div>
                  )}
                  {property.landlordPhone && (
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2">{property.landlordPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="card bg-primary-50 border-primary-200 mb-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Download Complete Report
            </h3>
            <p className="text-gray-600 mb-6">
              Get the full PDF report with all room details, photos, and professional formatting.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={downloadReport}
                className="btn-primary flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download PDF Report</span>
              </button>
              
              <button
                onClick={previewReport}
                className="btn-secondary flex items-center justify-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Preview in Browser</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="card bg-gray-50">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Security Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• This shared link expires on {new Date(report.expiresAt).toLocaleDateString()}</p>
                <p>• Report generated on {new Date(reportData.generatedAt).toLocaleDateString()}</p>
                <p>• All photos include timestamps and watermarks for authenticity</p>
                <p>• Access to this report is logged for security purposes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Shield className="w-4 h-4" />
            <span>Generated by DepositDefender • Privacy-First Rental Documentation</span>
          </div>
        </div>
      </main>
    </div>
  )
}