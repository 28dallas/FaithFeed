'use client'

import { Heart, MessageCircle, Share2, Plus, Home as HomeIcon, Users, Bookmark, Play, Pause, Trash2, Volume2, Sun, Moon, Send, X, LogOut, User, Filter } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface VideoReel {
  id: number
  creator: string
  handle: string
  title: string
  caption: string
  likes: number
  comments: Comment[]
  shares: number
  videoUrl: string
  isLiked: boolean
  topic?: string
  pastorId?: number
}

interface Comment {
  id: number
  author: string
  authorEmail: string
  text: string
  timestamp: string
}

const mockReels: VideoReel[] = []

export default function Home() {
  const [theme, setTheme] = useState('dark')
  const [reels, setReels] = useState<VideoReel[]>([])
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isPastor, setIsPastor] = useState(false)
  const [activeTab, setActiveTab] = useState('feeds')
  const [playingStates, setPlayingStates] = useState<{[key: number]: boolean}>({})
  const [showPlayButton, setShowPlayButton] = useState<{[key: number]: boolean}>({})
  const [showComments, setShowComments] = useState<{[key: number]: boolean}>({})
  const [newComment, setNewComment] = useState('')
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [showTopicFilter, setShowTopicFilter] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('All Topics')
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const topics = ['All Topics', 'Prayer', 'Love', 'Worship', 'Grace', 'Purpose', 'Faith', 'Hope', 'Healing', 'Salvation', 'Family']

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      window.location.href = '/login'
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setIsAdmin(parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin')
    
    const savedPastors = localStorage.getItem('faithfeed_pastors')
    const pastors = savedPastors ? JSON.parse(savedPastors) : []
    setIsPastor(pastors.some((pastor: any) => pastor.email === parsedUser.email) || parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin')
    
    const savedTheme = localStorage.getItem('faithfeed_theme')
    if (savedTheme) setTheme(savedTheme)
    
    const uploadedVideos = localStorage.getItem('faithfeed_videos')
    let localVideos = []
    if (uploadedVideos) {
      localVideos = JSON.parse(uploadedVideos)
    }

    // Fetch globally persisted uploads from server
    fetch('/api/videos')
      .then(res => res.json())
      .then((serverVideos: any[]) => {
        if (serverVideos && serverVideos.length > 0) {
          // Merge server videos with local videos, avoiding duplicates
          const allVideos = [...serverVideos, ...localVideos]
          const uniqueVideos = allVideos.filter((video, index, self) => 
            index === self.findIndex(v => v.id === video.id)
          )
          setReels(uniqueVideos)
        } else {
          setReels(localVideos)
        }
      })
      .catch(() => {
        setReels(localVideos)
      })
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            video.play().catch(console.error)
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
  }, [reels])

  const handleLike = (reelId: number) => {
    const updatedReels = reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          isLiked: !reel.isLiked,
          likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
        }
      }
      return reel
    })
    setReels(updatedReels)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('faithfeed_theme', newTheme)
  }

  const handleComment = (reelId: number) => {
    setShowComments(prev => ({ ...prev, [reelId]: !prev[reelId] }))
  }

  const addComment = (reelId: number) => {
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: Date.now(),
      author: user.name || user.email.split('@')[0],
      authorEmail: user.email,
      text: newComment.trim(),
      timestamp: new Date().toLocaleTimeString()
    }
    
    const updatedReels = reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          comments: [...reel.comments, comment]
        }
      }
      return reel
    })
    setReels(updatedReels)
    setNewComment('')
  }

  const deleteComment = (reelId: number, commentId: number, commentAuthorEmail: string) => {
    if (user.email !== commentAuthorEmail && !isAdmin) return
    
    const updatedReels = reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          comments: reel.comments.filter(comment => comment.id !== commentId)
        }
      }
      return reel
    })
    setReels(updatedReels)
  }

  const handleShare = (reelId: number) => {
    const updatedReels = reels.map(reel => {
      if (reel.id === reelId) {
        return {
          ...reel,
          shares: reel.shares + 1
        }
      }
      return reel
    })
    setReels(updatedReels)
  }

  const toggleVideoPlay = (reelId: number, videoElement: HTMLVideoElement) => {
    if (videoElement.paused) {
      videoElement.play()
      setPlayingStates(prev => ({ ...prev, [reelId]: true }))
    } else {
      videoElement.pause()
      setPlayingStates(prev => ({ ...prev, [reelId]: false }))
    }
    
    setShowPlayButton(prev => ({ ...prev, [reelId]: true }))
    setTimeout(() => {
      setShowPlayButton(prev => ({ ...prev, [reelId]: false }))
    }, 1000)
  }

  const deleteVideo = (reelId: number) => {
    if (confirm('Are you sure you want to delete this video?')) {
      const updatedReels = reels.filter(reel => reel.id !== reelId)
      setReels(updatedReels)
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  const logout = () => {
    localStorage.removeItem('faithfeed_user')
    window.location.href = '/login'
  }

  const filteredReels = selectedTopic === 'All Topics' 
    ? reels 
    : reels.filter(reel => reel.topic === selectedTopic)

  if (!user) return null

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="flex items-center space-x-4 mb-8">
          <img src="/img/logo3.png" alt="Faith Feed" className="w-16 h-16" />
          <span className="text-white font-bold text-2xl">Faith Feed</span>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">No videos yet</h2>
          <p className="text-gray-400 mb-6">Upload your first vertical video to get started!</p>
          {isAdmin && (
            <Link href="/upload" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium">
              Upload Video
            </Link>
          )}
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="flex items-center justify-around py-3">
            <button className="flex flex-col items-center space-y-1 text-purple-600">
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs font-medium">Feeds</span>
            </button>
            <Link href="/pastors" className="flex flex-col items-center space-y-1 text-gray-600">
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Pastors</span>
            </Link>
            {isAdmin ? (
              <Link href="/upload" className="flex flex-col items-center space-y-1 text-gray-600">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium">Upload</span>
              </Link>
            ) : (
              <button className="flex flex-col items-center space-y-1 text-gray-600">
                <Users className="w-6 h-6" />
                <span className="text-xs font-medium">Community</span>
              </button>
            )}
            <button className="flex flex-col items-center space-y-1 text-gray-600">
              <Bookmark className="w-6 h-6" />
              <span className="text-xs font-medium">Saved</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen overflow-y-scroll snap-y snap-mandatory ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="fixed top-4 left-4 z-50">
        <div className="flex items-center space-x-4">
          <img src="/img/logo3.png" alt="Faith Feed" className="w-16 h-16" />
          <span className={`font-bold text-2xl ${theme === 'dark' ? 'text-white' : 'text-black'}`}>Faith Feed</span>
        </div>
      </div>

      <div className="fixed top-4 right-4 z-50 flex items-center space-x-2">
        <button
          onClick={() => setShowTopicFilter(true)}
          className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
        >
          <Filter className="w-6 h-6" />
        </button>
        <button
          onClick={() => setShowLogoutPopup(true)}
          className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
        >
          <User className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}
        >
          {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      {filteredReels.map((reel, index) => (
        <div key={reel.id} className="relative h-screen snap-start flex items-center justify-center bg-black">
          <div className="relative w-full max-w-sm mx-auto h-full">
            <video
              ref={(el) => {
                if (el) videoRefs.current[index] = el
              }}
              className="w-full h-full object-cover"
              style={{ aspectRatio: '9/16', minHeight: '100vh' }}
              loop
              muted={false}
              playsInline
              autoPlay
              controls={false}
              preload="metadata"
              onClick={(e) => {
                const video = e.target as HTMLVideoElement
                toggleVideoPlay(reel.id, video)
              }}
            >
              <source src={reel.videoUrl} type="video/mp4" />
            </video>
            
            {showPlayButton[reel.id] && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black bg-opacity-50 rounded-full p-4">
                  {playingStates[reel.id] ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-6 z-10">
            {isAdmin && (
              <button 
                onClick={() => deleteVideo(reel.id)}
                className="p-3 bg-red-600 rounded-full hover:bg-red-700"
              >
                <Trash2 className="w-6 h-6 text-white" />
              </button>
            )}
            
            <div className="relative">
              {isAdmin ? (
                <div className="w-12 h-12 bg-gray-600 rounded-full border-2 border-white overflow-hidden flex items-center justify-center">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {reel.creator.charAt(0)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-12 h-12 bg-transparent border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {reel.creator.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white">
                <Plus className="w-3 h-3 text-white" />
              </div>
            </div>

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

            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleComment(reel.id)}
                className="p-3 text-white"
              >
                <MessageCircle className="w-7 h-7" />
              </button>
              <span className="text-white text-xs font-medium mt-1">
                {reel.comments.length}
              </span>
            </div>

            <div className="flex flex-col items-center">
              <button 
                onClick={() => handleShare(reel.id)}
                className="p-3 text-white"
              >
                <Share2 className="w-7 h-7" />
              </button>
              <span className="text-white text-xs font-medium mt-1">
                {formatCount(reel.shares)}
              </span>
            </div>
          </div>

          <div className="absolute bottom-24 left-4 right-20 z-10">
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg">{reel.handle}</h3>
              
              {reel.title && (
                <h4 className="text-white font-semibold text-base">{reel.title}</h4>
              )}
              
              <p className="text-white text-sm leading-relaxed">{reel.caption}</p>
            </div>
          </div>

          {showComments[reel.id] && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
              <div className={`w-full max-w-md h-2/3 rounded-t-2xl p-4 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Comments</h3>
                  <button onClick={() => setShowComments(prev => ({ ...prev, [reel.id]: false }))}>
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-80">
                  {reel.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <span className="text-sm font-bold">{comment.author.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-sm">{comment.author}</span>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{comment.timestamp}</span>
                          </div>
                          {(user.email === comment.authorEmail || isAdmin) && (
                            <button
                              onClick={() => deleteComment(reel.id, comment.id, comment.authorEmail)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm mt-1">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className={`flex-1 p-3 rounded-full border ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-100 border-gray-300 text-black'}`}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(reel.id)}
                  />
                  <button
                    onClick={() => addComment(reel.id)}
                    className="p-3 bg-purple-600 text-white rounded-full"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {showTopicFilter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`w-full max-w-md mx-4 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Filter by Topic</h3>
              <button onClick={() => setShowTopicFilter(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic)
                    setShowTopicFilter(false)
                  }}
                  className={`p-3 rounded-lg text-center ${
                    selectedTopic === topic
                      ? 'bg-purple-600 text-white'
                      : theme === 'dark'
                      ? 'bg-gray-800 text-white hover:bg-gray-700'
                      : 'bg-gray-100 text-black hover:bg-gray-200'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            <h3 className="text-lg font-bold mb-4">Logout</h3>
            <p className="mb-6">Are you sure you want to logout?</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-3">
          <button
            onClick={() => setActiveTab('feeds')}
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'feeds' ? 'text-purple-600' : 'text-gray-600'
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs font-medium">Feeds</span>
          </button>
          
          <Link
            href="/pastors"
            className={`flex flex-col items-center space-y-1 ${
              activeTab === 'pastors' ? 'text-purple-600' : 'text-gray-600'
            }`}
          >
            <Users className="w-6 h-6" />
            <span className="text-xs font-medium">Pastors</span>
          </Link>
          
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