// app/property/[id]/page.tsx
import { PropertyInspection } from '@/components/PropertyInspection'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PropertyPageProps {
  params: Promise<{ id: string }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <PropertyInspection propertyId={id} />
      </Suspense>
    </main>
  )
}