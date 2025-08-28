'use client'

import { useState } from 'react'
import { X, FileText, Download, Share, Eye } from 'lucide-react'
import { Property, PDFOptions } from '@/types'
import { generatePDF } from '@/lib/pdf-generator'
import { useApp } from '@/components/Providers'

interface ReportGeneratorProps {
  property: Property
  onClose: () => void
}

export function ReportGenerator({ property, onClose }: ReportGeneratorProps) {
  const { addNotification } = useApp()
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState<PDFOptions>({
    includePhotos: true,
    includeNotes: true,
    watermarkImages: true
  })

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const pdfBlob = await generatePDF(property, options)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${property.address.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_inspection_report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      addNotification({
        type: 'success',
        title: 'Report Generated',
        message: 'Your inspection report has been downloaded successfully.'
      })
      
      onClose()
    } catch (error) {
      console.error('Report generation failed:', error)
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate report. Please try again.'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const completedItems = property.rooms.reduce((sum, room) => 
    sum + room.items.filter(item => item.completed).length, 0)
  
  const issuesFound = property.rooms.reduce((sum, room) => 
    sum + room.items.filter(item => item.severity && item.completed).length, 0)
  
  const totalPhotos = property.rooms.reduce((sum, room) => 
    sum + room.items.reduce((itemSum, item) => itemSum + item.photos.length, 0), 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Generate Report</h2>
            <p className="text-gray-600 mt-1">Create a professional PDF inspection report</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            {/* Property Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Property Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary-600">{property.rooms.length}</div>
                  <div className="text-sm text-gray-600">Rooms</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-success-600">{completedItems}</div>
                  <div className="text-sm text-gray-600">Items Checked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning-600">{issuesFound}</div>
                  <div className="text-sm text-gray-600">Issues Found</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-600">{totalPhotos}</div>
                  <div className="text-sm text-gray-600">Photos Taken</div>
                </div>
              </div>
            </div>

            {/* Report Options */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Options</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includePhotos}
                    onChange={(e) => setOptions(prev => ({ ...prev, includePhotos: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Include Photos</span>
                    <p className="text-xs text-gray-600">Add all captured photos to the report</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.includeNotes}
                    onChange={(e) => setOptions(prev => ({ ...prev, includeNotes: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Include Notes</span>
                    <p className="text-xs text-gray-600">Add inspection notes and comments</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.watermarkImages}
                    onChange={(e) => setOptions(prev => ({ ...prev, watermarkImages: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Watermark Images</span>
                    <p className="text-xs text-gray-600">Add timestamp and authenticity watermarks</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h4 className="font-semibold text-primary-900 mb-2">Report Will Include:</h4>
              <ul className="text-sm text-primary-800 space-y-1">
                <li>• Property details and inspection date</li>
                <li>• Room-by-room inspection checklist</li>
                <li>• Issue severity ratings and locations</li>
                {options.includePhotos && <li>• High-resolution evidence photos</li>}
                {options.includeNotes && <li>• Detailed inspection notes</li>}
                <li>• Professional formatting for legal use</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div className="text-sm text-gray-600">
            Report will be saved as PDF
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}