'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Home, User, Calendar, Mail, Phone } from 'lucide-react'
import { useApp } from '@/components/Providers'
import { PropertyFormData, Property, Room } from '@/types'
import { getAllRoomTypes, createRoomFromTemplate } from '@/lib/room-templates'

interface CreatePropertyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePropertyModal({ isOpen, onClose }: CreatePropertyModalProps) {
  const router = useRouter()
  const { updateProperty } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<PropertyFormData>({
    address: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    tenantName: '',
    tenantEmail: '',
    moveOutDate: ''
  })
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([])

  if (!isOpen) return null

  const handleInputChange = (field: keyof PropertyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleRoomType = (roomType: string) => {
    setSelectedRoomTypes(prev => 
      prev.includes(roomType)
        ? prev.filter(type => type !== roomType)
        : [...prev, roomType]
    )
  }

  const handleNext = () => {
    if (step === 1) {
      // Validate required fields
      if (!formData.address.trim() || !formData.tenantName.trim() || !formData.moveOutDate) {
        return
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const handleSubmit = async () => {
    if (selectedRoomTypes.length === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      // Create property with selected rooms
      const propertyId = `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const rooms: Room[] = selectedRoomTypes.map(roomType => 
        createRoomFromTemplate(roomType as any)
      )

      const property: Property = {
        id: propertyId,
        address: formData.address.trim(),
        landlordName: formData.landlordName.trim() || undefined,
        landlordEmail: formData.landlordEmail.trim() || undefined,
        landlordPhone: formData.landlordPhone.trim() || undefined,
        tenantName: formData.tenantName.trim(),
        tenantEmail: formData.tenantEmail.trim() || undefined,
        moveOutDate: formData.moveOutDate,
        createdAt: new Date().toISOString(),
        rooms,
        overallProgress: 0
      }

      await updateProperty(property)
      
      // Reset form
      setFormData({
        address: '',
        landlordName: '',
        landlordEmail: '',
        landlordPhone: '',
        tenantName: '',
        tenantEmail: '',
        moveOutDate: ''
      })
      setSelectedRoomTypes([])
      setStep(1)
      onClose()

      // Navigate to property page
      router.push(`/property/${propertyId}`)
    } catch (error) {
      console.error('Failed to create property:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const roomTypeOptions = [
    { type: 'kitchen', label: 'Kitchen', icon: '🍳', description: 'Appliances, cabinets, plumbing' },
    { type: 'bathroom', label: 'Bathroom', icon: '🛁', description: 'Fixtures, tiles, ventilation' },
    { type: 'bedroom', label: 'Bedroom', icon: '🛏️', description: 'Walls, flooring, closets' },
    { type: 'living-room', label: 'Living Room', icon: '🛋️', description: 'Common areas, fixtures' },
    { type: 'general', label: 'General Areas', icon: '🏠', description: 'Hallways, exterior, utilities' }
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {step === 1 ? 'Create New Property' : 'Select Room Types'}
            </h2>
            <p className="text-gray-600 mt-1">
              {step === 1 
                ? 'Enter your property and tenant details'
                : 'Choose which rooms you want to inspect'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-3 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>Property Details</span>
            <span>Room Selection</span>
          </div>
        </div>

        {/* Step 1: Property Details */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            {/* Property Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-2" />
                Property Address *
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State 12345"
                className="input-field"
                required
              />
            </div>

            {/* Tenant Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Your Name *
                </label>
                <input
                  id="tenantName"
                  type="text"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  placeholder="Your full name"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label htmlFor="tenantEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Your Email
                </label>
                <input
                  id="tenantEmail"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  placeholder="your.email@example.com"
                  className="input-field"
                />
              </div>
            </div>

            {/* Move-out Date */}
            <div>
              <label htmlFor="moveOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Move-out Date *
              </label>
              <input
                id="moveOutDate"
                type="date"
                value={formData.moveOutDate}
                onChange={(e) => handleInputChange('moveOutDate', e.target.value)}
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            {/* Landlord Information (Optional) */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Landlord Information (Optional)
              </h3>
              <p className="text-sm text-gray-600">
                This information will be included in your generated reports
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="landlordName" className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name
                  </label>
                  <input
                    id="landlordName"
                    type="text"
                    value={formData.landlordName}
                    onChange={(e) => handleInputChange('landlordName', e.target.value)}
                    placeholder="Landlord name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="landlordEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    id="landlordEmail"
                    type="email"
                    value={formData.landlordEmail}
                    onChange={(e) => handleInputChange('landlordEmail', e.target.value)}
                    placeholder="landlord@example.com"
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="landlordPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone
                  </label>
                  <input
                    id="landlordPhone"
                    type="tel"
                    value={formData.landlordPhone}
                    onChange={(e) => handleInputChange('landlordPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div className="p-6">
            <p className="text-gray-600 mb-6">
              Select the types of rooms in your property. Each room type includes a comprehensive checklist.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {roomTypeOptions.map((room) => (
                <div
                  key={room.type}
                  onClick={() => toggleRoomType(room.type)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedRoomTypes.includes(room.type)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{room.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{room.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                      {selectedRoomTypes.includes(room.type) && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {selectedRoomTypes.length === 0 && (
              <p className="text-sm text-gray-500 mt-4 text-center">
                Select at least one room type to continue
              </p>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {step === 2 && (
              <button
                onClick={handleBack}
                className="btn-secondary"
              >
                Back
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            
            {step === 1 ? (
              <button
                onClick={handleNext}
                disabled={!formData.address.trim() || !formData.tenantName.trim() || !formData.moveOutDate}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={selectedRoomTypes.length === 0 || isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : `Create Property (${selectedRoomTypes.length} rooms)`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}