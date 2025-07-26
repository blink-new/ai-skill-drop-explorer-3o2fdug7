import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { PodcastStudio } from '@/components/podcast/PodcastStudio'
import { ScenarioBuilder } from '@/components/scenario/ScenarioBuilder'
import { SpotlightForm } from '@/components/spotlight/SpotlightForm'
import { CustomProduction } from '@/components/custom/CustomProduction'
import { ReviewDashboard } from '@/components/review/ReviewDashboard'
import { blink } from '@/blink/client'

type ActiveTab = 'podcast' | 'scenario' | 'spotlight' | 'custom' | 'review'

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('podcast')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading AI Skill Drop...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Skill Drop</h1>
          <p className="text-gray-600 mb-6">Content Creation Portal</p>
          <p className="text-gray-600 mb-6">
            Create podcast episodes, AI scenarios, content spotlights, and request custom video production to share your expertise with the community.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="py-8">
        {activeTab === 'podcast' && <PodcastStudio />}
        {activeTab === 'scenario' && <ScenarioBuilder />}
        {activeTab === 'spotlight' && <SpotlightForm />}
        {activeTab === 'custom' && <CustomProduction />}
        {activeTab === 'review' && <ReviewDashboard />}
      </main>
    </div>
  )
}

export default App