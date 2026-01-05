'use client'

import { ArrowLeft, Heart, MessageCircle, Share2, Play, Pause } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface VideoReel {
  id: number
  creator: string
  handle: string
  title: string
  caption: string
  likes: number
  comments: any[]
  shares: number
  videoUrl: string
  isLiked: boolean
  topic?: string
  pastorId?: number
}

interface Pastor {
  id: number
  name: string
  title: string
  church: string
  location: string
  phone?: string
  email?: string
  bio: string
  photo?: string
}

export default function PastorProfile() {
  const router = useRouter()
  const params = useParams()
  const pastorId = parseInt(params.id as string)
  
  const [pastor, setPastor] = useState<Pastor | null>(null)
  const [videos, setVideos] = useState<VideoReel[]>([])
  const [playingStates, setPlayingStates] = useState<{[key: number]: boolean}>({})
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    const savedPastors = localStorage.getItem('faithfeed_pastors')
    if (savedPastors) {
      const pastors = JSON.parse(savedPastors)
      const foundPastor = pastors.find((p: Pastor) => p.id === pastorId)
      setPastor(foundPastor)
    }

    // Load videos from server
    fetch('/api/videos')
      .then(res => res.json())
      .then((serverVideos: VideoReel[]) => {
        if (serverVideos) {
          const pastorVideos = serverVideos.filter((video: VideoReel) => video.pastorId === pastorId)
          setVideos(pastorVideos)
        }
      })
      .catch(() => {})
  }, [pastorId])

  const toggleVideoPlay = (videoId: number, videoElement: HTMLVideoElement) => {
    if (videoElement.paused) {
      videoElement.play()
      setPlayingStates(prev => ({ ...prev, [videoId]: true }))
    } else {
      videoElement.pause()
      setPlayingStates(prev => ({ ...prev, [videoId]: false }))
    }
  }

  if (!pastor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Pastor not found</h2>
          <button 
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">{pastor.name}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col items-center text-center">
            {pastor.photo ? (
              <img src={pastor.photo} alt={pastor.name} className="w-32 h-32 rounded-full border-4 border-purple-200 object-cover" />
            ) : (
              <div className="w-32 h-32 bg-purple-100 rounded-full border-4 border-purple-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-purple-600">{pastor.name.charAt(0)}</span>
              </div>
            )}
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{pastor.name}</h2>
            <p className="text-purple-600 font-medium">{pastor.title}</p>
            <p className="text-gray-600">{pastor.church}</p>
            <p className="text-gray-500 text-sm">{pastor.location}</p>
            {pastor.bio && <p className="mt-3 text-gray-700 text-center">{pastor.bio}</p>}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Sermons ({videos.length})</h3>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No sermons available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {videos.map((video, index) => (
              <div key={video.id} className="relative bg-black rounded-lg overflow-hidden aspect-[9/16]">
                <video
                  ref={(el) => {
                    if (el) videoRefs.current[index] = el
                  }}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  onClick={(e) => {
                    const videoEl = e.target as HTMLVideoElement
                    toggleVideoPlay(video.id, videoEl)
                  }}
                >
                  <source src={video.videoUrl} type="video/mp4" />
                </video>
                
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  {playingStates[video.id] ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                  <h4 className="text-white font-semibold text-sm mb-1">{video.title}</h4>
                  <div className="flex items-center space-x-4 text-white text-xs">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{video.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{video.comments.length}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="w-3 h-3" />
                      <span>{video.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}