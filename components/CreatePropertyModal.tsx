'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, User, Calendar, Building } from 'lucide-react'
import { useApp } from '@/components/Providers'
import { PropertyFormData, Property, Room } from '@/types'
import { createRoomFromTemplate } from '@/lib/room-templates'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

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
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    moveInDate: '',
    moveOutDate: '',
    tenantName: '',
    landlordName: '',
    initialNotes: ''
  })
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([])

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

  const isStep1Valid = () => {
    return formData.addressLine1.trim() && 
           formData.city.trim() && 
           formData.state.trim() && 
           formData.zipCode.trim() && 
           formData.tenantName.trim()
  }

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) {
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const resetForm = () => {
    setFormData({
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      moveInDate: '',
      moveOutDate: '',
      tenantName: '',
      landlordName: '',
      initialNotes: ''
    })
    setSelectedRoomTypes([])
    setStep(1)
  }

  const handleSubmit = async () => {
    if (selectedRoomTypes.length === 0 || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      const propertyId = `property-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      const rooms: Room[] = selectedRoomTypes.map(roomType => 
        createRoomFromTemplate(roomType as any)
      )

      // Build full address from components
      const addressParts = [
        formData.addressLine1.trim(),
        formData.addressLine2.trim(),
        formData.city.trim(),
        formData.state.trim(),
        formData.zipCode.trim()
      ].filter(part => part.length > 0)
      
      const fullAddress = addressParts.join(', ')

      const property: Property = {
        id: propertyId,
        address: fullAddress,
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        zipCode: formData.zipCode.trim(),
        moveInDate: formData.moveInDate.trim() || undefined,
        moveOutDate: formData.moveOutDate.trim() || undefined,
        tenantName: formData.tenantName.trim(),
        landlordName: formData.landlordName.trim() || undefined,
        initialNotes: formData.initialNotes.trim() || undefined,
        createdAt: new Date().toISOString(),
        rooms,
        overallProgress: 0
      }

      // Save the property
      await updateProperty(property)
      
      // Reset form and close modal
      resetForm()
      onClose()

      // Navigate to property inspection page after a brief delay
      // This ensures the context has updated with the new property
      setTimeout(() => {
        router.push(`/property/${encodeURIComponent(propertyId)}`)
      }, 100)
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

  const progressValue = (step / 2) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Create New Property' : 'Select Room Types'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Enter your property information'
              : 'Choose which rooms you want to inspect'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="space-y-2">
          <Progress value={progressValue} />
          <div className="flex justify-between text-xs text-gray-600">
            <span className={step === 1 ? 'font-medium text-primary-600' : ''}>Property Information</span>
            <span className={step === 2 ? 'font-medium text-primary-600' : ''}>Room Selection</span>
          </div>
        </div>

        {/* Step 1: Property Information */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Home className="w-5 h-5 mr-2" />
                Property Information
              </h3>
              
              {/* Address Line 1 */}
              <div>
                <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 *
                </label>
                <Input
                  id="addressLine1"
                  value={formData.addressLine1}
                  onChange={(e) => handleInputChange('addressLine1', e.target.value)}
                  placeholder="123 Main Street"
                  required
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <Input
                  id="addressLine2"
                  value={formData.addressLine2}
                  onChange={(e) => handleInputChange('addressLine2', e.target.value)}
                  placeholder="Apt 2B, Unit 5, etc. (optional)"
                />
              </div>

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="12345"
                    required
                  />
                </div>
              </div>

              {/* Move Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="moveInDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Move-In Date
                  </label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => handleInputChange('moveInDate', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="moveOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Move-Out Date
                  </label>
                  <Input
                    id="moveOutDate"
                    type="date"
                    value={formData.moveOutDate}
                    onChange={(e) => handleInputChange('moveOutDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {/* Tenant Name */}
              <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Tenant Name *
                </label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Landlord/Management Name */}
              <div>
                <label htmlFor="landlordName" className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Landlord/Management Name
                </label>
                <Input
                  id="landlordName"
                  value={formData.landlordName}
                  onChange={(e) => handleInputChange('landlordName', e.target.value)}
                  placeholder="Property manager or landlord name (optional)"
                />
              </div>

              {/* Initial Notes */}
              <div>
                <label htmlFor="initialNotes" className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Notes
                </label>
                <textarea
                  id="initialNotes"
                  value={formData.initialNotes}
                  onChange={(e) => handleInputChange('initialNotes', e.target.value)}
                  placeholder="Any general notes about the property or move-out process..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Room Selection */}
        {step === 2 && (
          <div className="space-y-6">
            <p className="text-gray-600">
              Select the types of rooms in your property. Each room type includes a comprehensive checklist.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {roomTypeOptions.map((room) => (
                <Card
                  key={room.type}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedRoomTypes.includes(room.type)
                      ? 'ring-2 ring-primary-500 bg-primary-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleRoomType(room.type)}
                >
                  <CardContent className="p-4">
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
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedRoomTypes.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Select at least one room type to continue
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step === 2 && (
              <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            
            {step === 1 ? (
              <Button
                onClick={handleNext}
                disabled={!isStep1Valid()}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={selectedRoomTypes.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : `Create Property (${selectedRoomTypes.length} rooms)`}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}