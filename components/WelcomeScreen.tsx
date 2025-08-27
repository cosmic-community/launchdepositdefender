'use client'

import { useState, useEffect } from 'react'
import { Shield, CheckCircle, FileText, Share, Smartphone, Lock } from 'lucide-react'
import { CreatePropertyModal } from '@/components/CreatePropertyModal'
import { useApp } from '@/components/Providers'

export function WelcomeScreen() {
  const { properties } = useApp()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)

  // Hide welcome screen if properties exist
  useEffect(() => {
    if (properties.length > 0) {
      setShowWelcome(false)
    }
  }, [properties.length])

  if (!showWelcome) return null

  const features = [
    {
      icon: CheckCircle,
      title: 'Guided Inspections',
      description: 'Step-by-step room checklists ensure nothing is missed'
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Generate PDF reports with photos and timestamps'
    },
    {
      icon: Lock,
      title: 'Privacy First',
      description: 'All data stays on your device - no server uploads'
    },
    {
      icon: Share,
      title: 'Secure Sharing',
      description: 'Share reports via encrypted links with 7-day expiry'
    },
    {
      icon: Smartphone,
      title: 'Mobile Ready',
      description: 'Works offline as a Progressive Web App'
    },
    {
      icon: Shield,
      title: 'Legal Protection',
      description: 'Watermarked photos provide evidence authenticity'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 text-white rounded-2xl mb-6">
            <Shield className="w-10 h-10" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Deposit<span className="text-primary-600">Defender</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto text-balance">
            Protect your security deposit with comprehensive move-out documentation. 
            Generate professional reports that landlords respect and courts accept.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Start Your Inspection
            </button>
            
            <div className="text-sm text-gray-500 flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>100% Private • No Account Required</span>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card hover:shadow-lg transition-all duration-200 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="card bg-white/80 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Create Property', desc: 'Enter your rental details and move-out date' },
              { step: '2', title: 'Inspect Rooms', desc: 'Follow guided checklists for each room type' },
              { step: '3', title: 'Document Issues', desc: 'Capture photos and tag severity levels' },
              { step: '4', title: 'Generate Report', desc: 'Create a professional PDF ready to share' }
            ].map((step, index) => (
              <div key={step.step} className="text-center">
                <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                  {step.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-6 left-full w-6 h-0.5 bg-primary-200 transform translate-x-2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <div className="flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-primary-600 mr-2" />
            <span className="font-semibold text-gray-900">Your Privacy is Protected</span>
          </div>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            All your inspection data is stored locally on your device using IndexedDB. 
            Nothing is sent to our servers unless you choose to share a report via secure link. 
            You maintain complete control over your data.
          </p>
        </div>
      </div>

      {/* Create Property Modal */}
      <CreatePropertyModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  )
}