// app/property/[id]/room/[roomId]/page.tsx
import { RoomInspection } from '@/components/RoomInspection'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface RoomPageProps {
  params: Promise<{ id: string; roomId: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id, roomId } = await params
  
  return (
    <main className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner />}>
        <RoomInspection propertyId={id} roomId={roomId} />
      </Suspense>
    </main>
  )
}