'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Home, User, Calendar, Mail, Phone } from 'lucide-react'
import { useApp } from '@/components/Providers'
import { PropertyFormData, Property, Room } from '@/types'
import { getAllRoomTypes, createRoomFromTemplate } from '@/lib/room-templates'
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
    address: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    tenantName: '',
    tenantEmail: '',
    moveOutDate: ''
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

  const handleNext = () => {
    if (step === 1) {
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
              ? 'Enter your property and tenant details'
              : 'Choose which rooms you want to inspect'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="space-y-2">
          <Progress value={progressValue} />
          <div className="flex justify-between text-xs text-gray-600">
            <span className={step === 1 ? 'font-medium text-primary-600' : ''}>Property Details</span>
            <span className={step === 2 ? 'font-medium text-primary-600' : ''}>Room Selection</span>
          </div>
        </div>

        {/* Step 1: Property Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                <Home className="w-4 h-4 inline mr-2" />
                Property Address *
              </label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main St, City, State 12345"
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Your Name *
                </label>
                <Input
                  id="tenantName"
                  value={formData.tenantName}
                  onChange={(e) => handleInputChange('tenantName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="tenantEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Your Email
                </label>
                <Input
                  id="tenantEmail"
                  type="email"
                  value={formData.tenantEmail}
                  onChange={(e) => handleInputChange('tenantEmail', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="moveOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Move-out Date *
              </label>
              <Input
                id="moveOutDate"
                type="date"
                value={formData.moveOutDate}
                onChange={(e) => handleInputChange('moveOutDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

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
                  <Input
                    id="landlordName"
                    value={formData.landlordName}
                    onChange={(e) => handleInputChange('landlordName', e.target.value)}
                    placeholder="Landlord name"
                  />
                </div>

                <div>
                  <label htmlFor="landlordEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <Input
                    id="landlordEmail"
                    type="email"
                    value={formData.landlordEmail}
                    onChange={(e) => handleInputChange('landlordEmail', e.target.value)}
                    placeholder="landlord@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="landlordPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone
                  </label>
                  <Input
                    id="landlordPhone"
                    type="tel"
                    value={formData.landlordPhone}
                    onChange={(e) => handleInputChange('landlordPhone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
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
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            
            {step === 1 ? (
              <Button
                onClick={handleNext}
                disabled={!formData.address.trim() || !formData.tenantName.trim() || !formData.moveOutDate}
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