// app/shared/[shareId]/page.tsx
import { SharedReportView } from '@/components/SharedReportView'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface SharedReportPageProps {
  params: Promise<{ shareId: string }>
}

export default async function SharedReportPage({ params }: SharedReportPageProps) {
  const { shareId } = await params
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <SharedReportView shareId={shareId} />
      </Suspense>
    </main>
  )
}