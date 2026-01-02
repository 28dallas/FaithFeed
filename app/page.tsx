'use client'

import { Heart, MessageCircle, Share2, Plus, Home, Users, Bookmark } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface VideoReel {
  id: number
  creator: string
  handle: string
  caption: string
  likes: number
  comments: number
  shares: number
  videoUrl: string
  isLiked: boolean
}

const mockReels: VideoReel[] = [
  {
    id: 1,
    creator: "Pastor T Mwangi",
    handle: "@PastorTMwangi",
    caption: "The greatest gift you can give your children is to love your wife",
    likes: 12400,
    comments: 892,
    shares: 234,
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    isLiked: false
  },
  {
    id: 2,
    creator: "Sarah Grace",
    handle: "@SarahGrace",
    caption: "Walking in faith means trusting God even when you can't see the path ahead 🙏",
    likes: 8900,
    comments: 456,
    shares: 123,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    isLiked: true
  },
  {
    id: 3,
    creator: "Youth Pastor Mike",
    handle: "@YouthPastorMike",
    caption: "God's love never fails, even in our darkest moments. Hold on to hope! ✨",
    likes: 15600,
    comments: 1200,
    shares: 567,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    isLiked: false
  },
  {
    id: 4,
    creator: "Pastor David",
    handle: "@PastorDavid",
    caption: "Prayer is not asking. Prayer is putting oneself in the hands of God 🙌",
    likes: 9800,
    comments: 678,
    shares: 234,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    isLiked: false
  },
  {
    id: 5,
    creator: "Sister Mary",
    handle: "@SisterMary",
    caption: "Let your light shine before others, that they may see your good deeds 💡",
    likes: 11200,
    comments: 543,
    shares: 189,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    isLiked: true
  },
  {
    id: 6,
    creator: "Pastor John",
    handle: "@PastorJohn",
    caption: "Faith is taking the first step even when you don't see the whole staircase",
    likes: 13500,
    comments: 789,
    shares: 345,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    isLiked: false
  },
  {
    id: 7,
    creator: "Minister Grace",
    handle: "@MinisterGrace",
    caption: "God's timing is perfect. Trust the process and have faith in His plan 🕊️",
    likes: 7600,
    comments: 432,
    shares: 156,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    isLiked: false
  },
  {
    id: 8,
    creator: "Pastor Emmanuel",
    handle: "@PastorEmmanuel",
    caption: "Be still and know that I am God. Find peace in His presence 🕊️",
    likes: 10300,
    comments: 612,
    shares: 278,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    isLiked: true
  },
  {
    id: 9,
    creator: "Sister Joy",
    handle: "@SisterJoy",
    caption: "Rejoice always, pray continually, give thanks in all circumstances 🎉",
    likes: 14800,
    comments: 923,
    shares: 412,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    isLiked: false
  },
  {
    id: 10,
    creator: "Pastor Samuel",
    handle: "@PastorSamuel",
    caption: "Love your neighbor as yourself. Show kindness to everyone you meet ❤️",
    likes: 16200,
    comments: 1045,
    shares: 523,
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    isLiked: true
  }
]

export default function Home() {
  const [reels, setReels] = useState<VideoReel[]>(mockReels)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState('feeds')
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    // Check if user is Pastor Isaac Mwangi (admin)
    setIsAdmin(parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin')
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play()
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [])

  const handleLike = (reelId: number) => {
    setReels(reels.map(reel => 
      reel.id === reelId 
        ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
        : reel
    ))
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (!user) return null

  return (
    <div className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {/* Faith Feed Logo */}
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center space-x-4">
          <img src="/img/logo.png" alt="Faith Feed" className="w-16 h-16" />
          <span className="text-white font-bold text-2xl">Faith Feed</span>
        </div>
      </div>

      {/* Video Reels */}
      {reels.map((reel, index) => (
        <div key={reel.id} className="relative h-screen snap-start flex items-center justify-center bg-black">
          {/* Video Background */}
          <video
            ref={(el) => {
              if (el) videoRefs.current[index] = el
            }}
            className="w-full h-full object-cover"
            loop
            muted
            playsInline
            controls={false}
            preload="metadata"
          >
            <source src={reel.videoUrl} type="video/mp4" />
          </video>

          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-10">
            {/* Creator Profile */}
            <div className="relative">
              <div className="w-12 h-12 bg-gray-600 rounded-full border-2 border-white overflow-hidden flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {reel.creator.charAt(0)}
                </span>
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Like Button */}
            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleLike(reel.id)}
                className={`p-3 rounded-full ${reel.isLiked ? 'text-red-500' : 'text-white'}`}
              >
                <Heart className={`w-7 h-7 ${reel.isLiked ? 'fill-current' : ''}`} />
              </button>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(reel.likes)}
              </span>
            </div>

            {/* Comment Button */}
            <div className="flex flex-col items-center">
              <button className="p-3 text-white">
                <MessageCircle className="w-7 h-7" />
              </button>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(reel.comments)}
              </span>
            </div>

            {/* Share Button */}
            <div className="flex flex-col items-center">
              <button className="p-3 text-white">
                <Share2 className="w-7 h-7" />
              </button>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(reel.shares)}
              </span>
            </div>
          </div>

          {/* Bottom Content Overlay */}
          <div className="absolute bottom-24 left-4 right-20 z-10">
            <div className="space-y-3">
              {/* Creator Handle */}
              <h3 className="text-white font-bold text-lg">{reel.handle}</h3>
              
              {/* Caption */}
              <p className="text-white text-sm leading-relaxed">{reel.caption}</p>
            </div>
          </div>
        </div>
      ))}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => setActiveTab('feeds')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'feeds' ? 'text-purple-600' : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-medium">Feeds</span>
          </button>
          
          <button
            onClick={() => setActiveTab('psalters')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'psalters' ? 'text-purple-600' : 'text-gray-600'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Psalters</span>
          </button>
          
          {isAdmin ? (
            <Link href="/upload" className="flex flex-col items-center space-y-1 text-gray-600">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium">Upload</span>
            </Link>
          ) : (
            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center space-y-1 ${
                activeTab === 'community' ? 'text-purple-600' : 'text-gray-600'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Community</span>
            </button>
          )}
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'saved' ? 'text-purple-600' : 'text-gray-600'
            }`}
          >
            <Bookmark className="w-6 h-6" />
            <span className="text-xs font-medium">Saved</span>
          </button>
        </div>
      </div>
    </div>
  )
}