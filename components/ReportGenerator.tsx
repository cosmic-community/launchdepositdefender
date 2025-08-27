'use client'

import { useState } from 'react'
import { Property, Report } from '@/types'
import { X, FileText, Download, Share, Eye } from 'lucide-react'
import { generatePropertyReport } from '@/lib/pdf-generator'
import { SharingManager } from '@/lib/sharing-utils'
import { dbManager } from '@/lib/db'

interface ReportGeneratorProps {
  property: Property
  onClose: () => void
}

export function ReportGenerator({ property, onClose }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportBlob, setReportBlob] = useState<Blob | null>(null)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const blob = await generatePropertyReport(property)
      setReportBlob(blob)

      // Save report to database
      const report: Report = {
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        propertyId: property.id,
        generatedAt: new Date().toISOString(),
        pdfBlob: blob,
        property
      }

      await dbManager.saveReport(report)
    } catch (error) {
      console.error('Report generation failed:', error)
      setError('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadReport = () => {
    if (!reportBlob) return

    const url = URL.createObjectURL(reportBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `DepositDefender-Report-${property.address.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const previewReport = () => {
    if (!reportBlob) return

    const url = URL.createObjectURL(reportBlob)
    window.open(url, '_blank')
  }

  const shareReport = async () => {
    if (!reportBlob) return

    setIsSharing(true)
    setError(null)

    try {
      const report: Report = {
        id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        propertyId: property.id,
        generatedAt: new Date().toISOString(),
        pdfBlob: reportBlob,
        property
      }

      const link = await SharingManager.createShareableLink(report)
      setShareLink(link)

      // Copy to clipboard
      const copied = await SharingManager.copyToClipboard(link)
      if (copied) {
        alert('Share link copied to clipboard!')
      }
    } catch (error) {
      console.error('Sharing failed:', error)
      setError('Failed to create share link. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareLink = async () => {
    if (!shareLink) return

    const copied = await SharingManager.copyToClipboard(shareLink)
    if (copied) {
      alert('Link copied to clipboard!')
    } else {
      alert('Failed to copy link. Please copy manually.')
    }
  }

  const getReportStats = () => {
    const totalItems = property.rooms.reduce((sum, room) => sum + room.totalItems, 0)
    const completedItems = property.rooms.reduce((sum, room) => sum + room.completedItems, 0)
    const issuesFound = property.rooms.reduce((sum, room) => 
      sum + room.items.filter(item => item.severity && item.completed).length, 0)
    const totalPhotos = property.rooms.reduce((sum, room) => 
      sum + room.items.reduce((photoSum, item) => photoSum + item.photos.length, 0), 0)

    return { totalItems, completedItems, issuesFound, totalPhotos }
  }

  const stats = getReportStats()

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
            <p className="text-gray-600 mt-1">Create a professional PDF report of your inspection</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Property Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Summary</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{property.address}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Items:</span>
                  <span className="ml-2 font-semibold">{stats.totalItems}</span>
                </div>
                <div>
                  <span className="text-gray-600">Completed:</span>
                  <span className="ml-2 font-semibold text-success-600">{stats.completedItems}</span>
                </div>
                <div>
                  <span className="text-gray-600">Issues:</span>
                  <span className="ml-2 font-semibold text-warning-600">{stats.issuesFound}</span>
                </div>
                <div>
                  <span className="text-gray-600">Photos:</span>
                  <span className="ml-2 font-semibold text-primary-600">{stats.totalPhotos}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Report Features */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Includes</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                Professional property and tenant information
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                Room-by-room inspection results with photos
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                Issue severity classifications and notes
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                Timestamped and watermarked photos for authenticity
              </div>
              <div className="flex items-center text-sm text-gray-700">
                <div className="w-2 h-2 bg-success-500 rounded-full mr-3" />
                Professional formatting suitable for legal use
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p className="text-danger-700 text-sm">{error}</p>
            </div>
          )}

          {/* Generation Step */}
          {!reportBlob && (
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <p className="text-gray-600 mb-6">
                Ready to generate your professional inspection report with {stats.totalPhotos} photos 
                and {stats.issuesFound} documented issues.
              </p>
              <button
                onClick={generateReport}
                disabled={isGenerating}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Generating PDF...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Generate Report</span>
                  </div>
                )}
              </button>
            </div>
          )}

          {/* Report Ready */}
          {reportBlob && (
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 text-success-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Generated!</h3>
              <p className="text-gray-600 mb-6">
                Your professional inspection report is ready. You can download it, preview it, 
                or share it securely.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={downloadReport}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                
                <button
                  onClick={previewReport}
                  className="btn-secondary flex items-center justify-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                
                <button
                  onClick={shareReport}
                  disabled={isSharing}
                  className="btn-secondary flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSharing ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                      <span>Creating Link...</span>
                    </>
                  ) : (
                    <>
                      <Share className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>

              {/* Share Link */}
              {shareLink && (
                <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <h4 className="font-medium text-primary-800 mb-2">Secure Share Link Created</h4>
                  <p className="text-sm text-primary-700 mb-3">
                    Link expires in 7 days and can be accessed without login.
                  </p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-primary-300 rounded text-sm bg-white"
                    />
                    <button
                      onClick={copyShareLink}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Report will include all inspection data and photos
            </p>
            <button onClick={onClose} className="btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}