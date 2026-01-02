'use client'

import { ArrowLeft, TrendingUp, Eye, Heart, MessageCircle, Share2, Users, Video, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">Analytics</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Total Views</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">45.6K</div>
              <div className="text-sm text-green-600">+12.5% this week</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Total Likes</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">3.2K</div>
              <div className="text-sm text-green-600">+8.2% this week</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Comments</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">890</div>
              <div className="text-sm text-green-600">+15.3% this week</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">Followers</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">12.4K</div>
              <div className="text-sm text-green-600">+12.5% this week</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center space-x-2">
              <Video className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">Videos</span>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-gray-600">Total uploaded</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Top Performing Video
          </h3>
          <div>
            <h4 className="font-medium">Faith in Difficult Times</h4>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                8.9K views
              </span>
              <span className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                85% engagement
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}