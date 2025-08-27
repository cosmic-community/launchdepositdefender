import { WelcomeScreen } from '@/components/WelcomeScreen'
import { PropertyDashboard } from '@/components/PropertyDashboard'
import { InstallPrompt } from '@/components/InstallPrompt'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <InstallPrompt />
      <WelcomeScreen />
      <PropertyDashboard />
    </main>
  )
}