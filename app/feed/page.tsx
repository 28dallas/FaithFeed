'use client'

import { Heart, MessageCircle, Share2, Plus, Home, Users, Bookmark, X, Send, Volume2, VolumeX, Play, Pause, Search, MoreHorizontal, LogOut, Trash2, Filter, Bell, Sun, Moon } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import NotificationPanel from '../components/NotificationPanel'
import { useTheme } from '../components/ThemeProvider'

interface Comment {
  id: number
  user: string
  text: string
  timestamp: string
  replies?: Comment[]
  parentId?: number
}

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
  commentsList?: Comment[]
  category: string
  duration: number
  views: number
  isSaved: boolean
}

const mockReels: VideoReel[] = [
  {
    id: 1,
    creator: "Pastor T Mwangi",
    handle: "@PastorTMwangi",
    caption: "The greatest gift you can give your children is to love your wife #FamilyFirst #Love #Marriage",
    likes: 0,
    comments: 0,
    shares: 0,
    videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
    isLiked: false,
    category: "Sermon",
    duration: 45,
    views: 0,
    isSaved: false
  },
  {
    id: 2,
    creator: "Sarah Grace",
    handle: "@SarahGrace",
    caption: "Walking in faith means trusting God even when you can't see the path ahead #Faith #Trust #God 🙏",
    likes: 0,
    comments: 0,
    shares: 0,
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    isLiked: false,
    category: "Testimony",
    duration: 32,
    views: 0,
    isSaved: false
  },
  {
    id: 3,
    creator: "Youth Pastor Mike",
    handle: "@YouthPastorMike",
    caption: "God's love never fails, even in our darkest moments. Hold on to hope! #Hope #GodsLove #Faith ✨",
    likes: 0,
    comments: 0,
    shares: 0,
    videoUrl: "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4",
    isLiked: false,
    category: "Worship",
    duration: 28,
    views: 0,
    isSaved: false
  }
]

export default function Feed() {
  const { theme, toggleTheme } = useTheme()
  const [reels, setReels] = useState<VideoReel[]>(mockReels.slice(0, 3))
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('feeds')
  const [showComments, setShowComments] = useState(false)
  const [activeReelId, setActiveReelId] = useState<number | null>(null)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isMuted, setIsMuted] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [lastTap, setLastTap] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCategories, setShowCategories] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareReelId, setShareReelId] = useState<number | null>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const categories = ['All', 'Sermon', 'Worship', 'Prayer', 'Teaching', 'Testimony']

  const loadMore = useCallback(() => {
    if (isLoading || reels.length >= mockReels.length) return
    setIsLoading(true)
    
    setTimeout(() => {
      const nextBatch = mockReels.slice(reels.length, reels.length + 3)
      setReels(prev => [...prev, ...nextBatch])
      setIsLoading(false)
    }, 500)
  }, [reels.length, isLoading])

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setIsAdmin(parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin')

    // Load saved videos state
    const savedVideos = JSON.parse(localStorage.getItem('faithfeed_saved_videos') || '{}')
    const userSaves = savedVideos[parsedUser.email] || []
    setReels(reels.map(reel => ({
      ...reel,
      isSaved: userSaves.includes(reel.id)
    })))

    // Fetch globally persisted uploads from server and prepend them
    fetch('/api/videos')
      .then(res => res.json())
      .then((videos: any[]) => {
        if (videos && videos.length > 0) {
          // Ensure new videos come first, and avoid duplicating mock items by id
          const existingIds = new Set(reels.map(r => r.id))
          const fresh = videos.filter(v => !existingIds.has(v.id))
          if (fresh.length) setReels(prev => [...fresh, ...prev])
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMore()
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [loadMore])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            if (!video.src && video.dataset.src) {
              video.src = video.dataset.src
              video.load()
            }
            video.play().catch(() => {})
            video.muted = isMuted
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.5, rootMargin: '100px' }
    )

    videoRefs.current.forEach((video) => {
      if (video) {
        observer.observe(video)
        video.muted = isMuted
      }
    })

    return () => observer.disconnect()
  }, [isMuted, reels])

  const handleLike = (reelId: number) => {
    const userId = user?.email || 'anonymous'
    const likedVideos = JSON.parse(localStorage.getItem('faithfeed_liked_videos') || '{}')
    const userLikes = likedVideos[userId] || []
    const hasLiked = userLikes.includes(reelId)
    
    setReels(reels.map(reel => {
      if (reel.id === reelId) {
        const newLikes = hasLiked ? reel.likes - 1 : reel.likes + 1
        return { ...reel, isLiked: !hasLiked, likes: Math.max(0, newLikes) }
      }
      return reel
    }))
    
    // Update user's liked videos
    if (hasLiked) {
      likedVideos[userId] = userLikes.filter((id: number) => id !== reelId)
    } else {
      likedVideos[userId] = [...userLikes, reelId]
    }
    localStorage.setItem('faithfeed_liked_videos', JSON.stringify(likedVideos))
  }

  const handleSave = (reelId: number) => {
    const userId = user?.email || 'anonymous'
    const savedVideos = JSON.parse(localStorage.getItem('faithfeed_saved_videos') || '{}')
    const userSaves = savedVideos[userId] || []
    const isSaved = userSaves.includes(reelId)

    setReels(reels.map(reel =>
      reel.id === reelId
        ? { ...reel, isSaved: !isSaved }
        : reel
    ))

    // Update user's saved videos
    if (isSaved) {
      savedVideos[userId] = userSaves.filter((id: number) => id !== reelId)
    } else {
      savedVideos[userId] = [...userSaves, reelId]
    }
    localStorage.setItem('faithfeed_saved_videos', JSON.stringify(savedVideos))
  }

  const handleComment = (reelId: number) => {
    setActiveReelId(reelId)
    setShowComments(true)
  }

  const addComment = () => {
    if (!newComment.trim() || !activeReelId) return
    
    const comment: Comment = {
      id: Date.now(),
      user: user?.name || 'You',
      text: newComment,
      timestamp: 'now',
      replies: []
    }
    
    setReels(reels.map(reel => 
      reel.id === activeReelId 
        ? { 
            ...reel, 
            comments: reel.comments + 1,
            commentsList: [...(reel.commentsList || []), comment]
          }
        : reel
    ))
    
    setNewComment('')
  }

  const addReply = (parentId: number) => {
    if (!replyText.trim() || !activeReelId) return
    
    const reply: Comment = {
      id: Date.now(),
      user: user?.name || 'You',
      text: replyText,
      timestamp: 'now',
      parentId
    }
    
    setReels(reels.map(reel => 
      reel.id === activeReelId 
        ? { 
            ...reel, 
            comments: reel.comments + 1,
            commentsList: reel.commentsList?.map(comment => 
              comment.id === parentId 
                ? { ...comment, replies: [...(comment.replies || []), reply] }
                : comment
            ) || []
          }
        : reel
    ))
    
    setReplyText('')
    setReplyingTo(null)
  }

  const handleDoubleTap = (reelId: number) => {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleLike(reelId)
      const heartElement = document.createElement('div')
      heartElement.innerHTML = '❤️'
      heartElement.className = 'fixed text-6xl animate-ping pointer-events-none z-50'
      heartElement.style.left = '50%'
      heartElement.style.top = '50%'
      heartElement.style.transform = 'translate(-50%, -50%)'
      document.body.appendChild(heartElement)
      setTimeout(() => document.body.removeChild(heartElement), 1000)
    }
    setLastTap(now)
  }

  const handleShare = (reelId: number) => {
    setShareReelId(reelId)
    setShowShareModal(true)
  }

  const shareToPlatform = (platform: string) => {
    const reel = reels.find(r => r.id === shareReelId)
    if (!reel) return

    const shareUrl = window.location.href
    const shareText = `${reel.caption} - Watch on Faith Feed`
    const shareTitle = `${reel.creator} - Faith Feed`

    let url = ''

    // Prefer native Web Share API when available (mobile). Increment only on success.
    if (navigator.share && (platform === 'whatsapp' || platform === 'facebook' || platform === 'twitter' || platform === 'telegram')) {
      navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
        .then(() => {
          setReels(reels.map(r => r.id === shareReelId ? { ...r, shares: r.shares + 1 } : r))
        })
        .catch(() => {
          // share cancelled or failed; do nothing
        })
        .finally(() => setShowShareModal(false))

      return
    }

    let shouldConfirmAfterClose = false
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        shouldConfirmAfterClose = true
        break
      case 'instagram':
        navigator.clipboard.writeText(shareUrl)
        alert('Link copied! Open Instagram and paste the link to share.')
        setShowShareModal(false)
        return
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
        shouldConfirmAfterClose = true
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
        shouldConfirmAfterClose = true
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
        shouldConfirmAfterClose = true
        break
      case 'copy':
        navigator.clipboard.writeText(shareUrl)
        alert('Link copied to clipboard!')
        setShowShareModal(false)
        return
    }

    if (url) {
      const win = window.open(url, '_blank', 'width=600,height=600')
      if (shouldConfirmAfterClose && win) {
        const timer = setInterval(() => {
          if (win.closed) {
            clearInterval(timer)
            const confirmed = confirm('Did you complete the share on the platform?')
            if (confirmed) {
              setReels(reels.map(r => r.id === shareReelId ? { ...r, shares: r.shares + 1 } : r))
            }
            setShowShareModal(false)
          }
        }, 500)
      } else {
        setShowShareModal(false)
      }
    } else {
      setShowShareModal(false)
    }
  }

  const handleDelete = (reelId: number) => {
    if (!isAdmin) return
    if (confirm('Are you sure you want to delete this video?')) {
      setReels(reels.filter(reel => reel.id !== reelId))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('faithfeed_user')
    window.location.href = '/login'
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    videoRefs.current.forEach(video => {
      if (video) video.muted = !isMuted
    })
  }

  const filteredReels = searchQuery
    ? reels.filter(reel =>
        reel.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reel.caption.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : selectedCategory === 'All'
    ? activeTab === 'saved'
      ? reels.filter(reel => reel.isSaved)
      : reels
    : activeTab === 'saved'
    ? reels.filter(reel => reel.category === selectedCategory && reel.isSaved)
    : reels.filter(reel => reel.category === selectedCategory)

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (!user) return null

  return (
    <div ref={containerRef} className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <img src="/img/logo3.png" alt="Faith Feed" className="w-8 h-8" />
            <span className="text-white font-bold text-lg">Faith Feed</span>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full group"
            >
              <Search className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Search
              </span>
            </button>
            <button 
              onClick={() => setShowCategories(!showCategories)}
              className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full group"
            >
              <Filter className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Filter
              </span>
            </button>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full group"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Notifications
              </span>
            </button>
            <button 
              onClick={toggleTheme}
              className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full group"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
            <button 
              onClick={toggleMute}
              className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full group"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </button>
            <button 
              onClick={handleLogout}
              className="relative p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-full group"
            >
              <LogOut className="w-5 h-5" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Logout
              </span>
            </button>
          </div>
        </div>
        
        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search creators or content..."
              className="w-full px-4 py-2 bg-white bg-opacity-20 text-white placeholder-gray-300 rounded-full focus:outline-none focus:bg-opacity-30"
              autoFocus
            />
          </div>
        )}

        {/* Categories Filter */}
        {showCategories && (
          <div className="px-4 pb-4">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-white text-black'
                      : 'bg-white bg-opacity-20 text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Reels */}
      {filteredReels.map((reel, index) => (
        <div key={reel.id} className="relative h-screen snap-start flex items-center justify-center bg-black">
          {/* Mobile-sized Video Container - Force Vertical */}
          <div className="relative w-full max-w-sm h-full bg-black overflow-hidden">
            {/* Video Background */}
            <div
              className="relative w-full h-full cursor-pointer"
              onDoubleClick={() => handleDoubleTap(reel.id)}
            >
              <video
                ref={(el) => {
                  if (el) videoRefs.current[index] = el
                }}
                className="w-full h-full object-cover"
                loop
                muted={isMuted}
                playsInline
                preload="none"
                data-src={reel.videoUrl}
                style={{ objectPosition: 'center' }}
              >
                <source src={reel.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-4 z-10">
              {/* Creator Profile */}
              <div className="relative">
                <div className="w-10 h-10 bg-gray-600 rounded-full border-2 border-white overflow-hidden flex items-center justify-center">
                  {(() => {
                    const savedProfiles = JSON.parse(localStorage.getItem('faithfeed_profiles') || '{}')
                    const creatorEmail = reel.creator === 'Pastor T Mwangi' ? 'mwangindengwaisaac@gmail.com' :
                                       reel.creator === 'Sarah Grace' ? 'sarah@example.com' : null
                    const creatorProfile = creatorEmail ? savedProfiles[creatorEmail] : null

                    return creatorProfile?.profilePicture ? (
                      <img src={creatorProfile.profilePicture} alt={reel.creator} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-xs">
                        {reel.creator.charAt(0)}
                      </span>
                    )
                  })()}
                </div>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                  <Plus className="w-2 h-2 text-white" />
                </div>
              </div>

              {/* Like Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleLike(reel.id)}
                  className={`p-2 rounded-full ${reel.isLiked ? 'text-red-500' : 'text-white'}`}
                >
                  <Heart className={`w-6 h-6 ${reel.isLiked ? 'fill-current' : ''}`} />
                </button>
                <span className="text-white text-xs font-medium mt-1">
                  {reel.likes > 0 ? formatCount(reel.likes) : ''}
                </span>
              </div>

              {/* Comment Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleComment(reel.id)}
                  className="p-2 text-white"
                >
                  <MessageCircle className="w-6 h-6" />
                </button>
                <span className="text-white text-xs font-medium mt-1">
                  {reel.comments > 0 ? formatCount(reel.comments) : ''}
                </span>
              </div>

              {/* Share Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleShare(reel.id)}
                  className="p-2 text-white"
                >
                  <Share2 className="w-6 h-6" />
                </button>
                <span className="text-white text-xs font-medium mt-1">
                  {reel.shares > 0 ? formatCount(reel.shares) : ''}
                </span>
              </div>

              {/* Save Button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleSave(reel.id)}
                  className={`p-2 rounded-full ${reel.isSaved ? 'text-yellow-400' : 'text-white'}`}
                >
                  <Bookmark className={`w-6 h-6 ${reel.isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* More Options */}
              <div className="flex flex-col items-center">
                <button className="p-2 text-white">
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>

              {/* Delete Button (Admin Only) */}
              {isAdmin && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleDelete(reel.id)}
                    className="relative p-2 text-red-500 hover:bg-red-500 hover:bg-opacity-20 rounded-full group"
                  >
                    <Trash2 className="w-6 h-6" />
                    <span className="absolute -left-12 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Delete
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Content Overlay */}
            <div className="absolute bottom-20 left-4 right-20 z-10">
              <div className="space-y-2">
                {/* Creator Handle */}
                <h3 className="text-white font-bold text-base">{reel.handle}</h3>
                
                {/* Caption with Hashtags */}
                <p className="text-white text-sm leading-relaxed">
                  {reel.caption.split(' ').map((word, i) => 
                    word.startsWith('#') ? (
                      <span key={i} className="text-blue-400 font-semibold">{word} </span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="h-screen flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p>Loading more videos...</p>
          </div>
        </div>
      )}

      {/* No Results */}
      {((searchQuery && filteredReels.length === 0) || (selectedCategory !== 'All' && filteredReels.length === 0) || (activeTab === 'saved' && filteredReels.length === 0)) && !isLoading && (
        <div className="h-screen flex items-center justify-center">
          <div className="text-center text-white">
            {activeTab === 'saved' ? (
              <>
                <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No saved videos</h3>
                <p className="text-gray-400">Save videos to watch them later</p>
              </>
            ) : (
              <>
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-gray-400">Try searching for something else or change category</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full h-2/3 rounded-t-3xl p-4 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Comments</h3>
              <button 
                onClick={() => setShowComments(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3">
              {activeReelId && reels.find(r => r.id === activeReelId)?.commentsList?.map(comment => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {comment.user.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{comment.user}</span>
                        <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                      </div>
                      <p className="text-sm mt-1">{comment.text}</p>
                      <button 
                        onClick={() => setReplyingTo(comment.id)}
                        className="text-xs text-gray-500 hover:text-gray-700 mt-1"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex space-x-3">
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {reply.user.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-xs">{reply.user}</span>
                              <span className="text-gray-500 text-xs">{reply.timestamp}</span>
                            </div>
                            <p className="text-xs mt-1">{reply.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reply Input */}
                  {replyingTo === comment.id && (
                    <div className="ml-11 flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-3 py-1 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-purple-500"
                        onKeyPress={(e) => e.key === 'Enter' && addReply(comment.id)}
                        autoFocus
                      />
                      <button
                        onClick={() => addReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="p-1 bg-purple-500 text-white rounded-full disabled:opacity-50 text-xs"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="text-xs text-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )) || (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
            
            {/* Comment Input */}
            <div className="flex items-center space-x-3 border-t pt-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {user?.name?.charAt(0) || 'Y'}
                </span>
              </div>
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && addComment()}
                />
                <button
                  onClick={addComment}
                  disabled={!newComment.trim()}
                  className="p-2 bg-purple-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <span className="text-xs font-medium">Pastors</span>
          </button>
          
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

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-80 max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share Video</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <button
                onClick={() => shareToPlatform('whatsapp')}
                className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📱</span>
                </div>
                <span className="text-xs font-medium">WhatsApp</span>
              </button>

              <button
                onClick={() => shareToPlatform('instagram')}
                className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📸</span>
                </div>
                <span className="text-xs font-medium">Instagram</span>
              </button>

              <button
                onClick={() => shareToPlatform('facebook')}
                className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">📘</span>
                </div>
                <span className="text-xs font-medium">Facebook</span>
              </button>

              <button
                onClick={() => shareToPlatform('twitter')}
                className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🐦</span>
                </div>
                <span className="text-xs font-medium">Twitter</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <button
                onClick={() => shareToPlatform('telegram')}
                className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">✈️</span>
                </div>
                <span className="text-xs font-medium">Telegram</span>
              </button>

              <button
                onClick={() => shareToPlatform('copy')}
                className="flex flex-col items-center space-y-2 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xl">📋</span>
                </div>
                <span className="text-xs font-medium">Copy Link</span>
              </button>

              <div className="col-span-2"></div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => shareToPlatform('copy')}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600">📋</span>
                </div>
                <span className="font-medium">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  )
}
