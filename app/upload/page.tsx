'use client'

import { ArrowLeft, Upload, Hash, Users, X } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string>('')
  const [title, setTitle] = useState('')
  const [quote, setQuote] = useState('')
  const [hashtags, setHashtags] = useState('')
  const [caption, setCaption] = useState('')
  const [taggedPastors, setTaggedPastors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pastorsList = [
    'Pastor Isaac Mwangi',
    'Pastor David Johnson', 
    'Pastor Sarah Grace',
    'Pastor Michael Thompson'
  ]

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    // Check if user is Pastor Isaac Mwangi (admin)
    const adminCheck = parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin'
    setIsAdmin(adminCheck)
    
    if (!adminCheck) {
      router.push('/')
      return
    }
  }, [router])

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      // Check file size (500MB limit)
      const maxSize = 500 * 1024 * 1024 // 500MB in bytes
      if (file.size > maxSize) {
        alert('Video file is too large. Please select a video under 500MB.')
        return
      }
      
      setSelectedVideo(file)
      const url = URL.createObjectURL(file)
      setVideoPreview(url)
    } else {
      alert('Please select a valid video file.')
    }
  }

  const handleUpload = async () => {
    if (!selectedVideo || !title.trim() || !caption.trim()) return
    
    setIsUploading(true)
    
    // Create video URL from file
    const videoUrl = URL.createObjectURL(selectedVideo)
    
    // Get existing videos from localStorage
    const existingVideos = localStorage.getItem('faithfeed_videos')
    const videos = existingVideos ? JSON.parse(existingVideos) : []
    
    // Create new video object
    const newVideo = {
      id: Date.now(), // Simple ID generation
      creator: user.name || user.email.split('@')[0],
      handle: `@${user.name?.replace(/\s+/g, '') || user.email.split('@')[0]}`,
      title: title.trim(),
      caption: caption + (hashtags ? ` ${hashtags}` : '') + (taggedPastors.length > 0 ? ` Tagged: ${taggedPastors.join(', ')}` : ''),
      likes: 0,
      comments: [],
      shares: 0,
      videoUrl: videoUrl,
      isLiked: false
    }
    
    // Add new video to the beginning of the array
    const updatedVideos = [newVideo, ...videos]
    
    // Save to localStorage
    localStorage.setItem('faithfeed_videos', JSON.stringify(updatedVideos))
    
    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      router.push('/')
    }, 2000)
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">Only Pastor Isaac Mwangi can upload videos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-800 rounded-full"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold">Upload Video</h1>
        <button
          onClick={handleUpload}
          disabled={!selectedVideo || !title.trim() || !caption.trim() || isUploading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? 'Posting...' : 'Post'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Video Preview Section */}
        <div className="flex-1 flex items-center justify-center bg-gray-900 p-4">
          {videoPreview ? (
            <div className="relative max-w-sm w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
              <video
                src={videoPreview}
                className="w-full h-full object-cover"
                controls
                loop
                muted
              />
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center w-full max-w-sm aspect-[9/16] border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-400 text-center">
                Click to select a video
              </p>
              <p className="text-gray-500 text-sm mt-2">
                MP4, MOV, AVI up to 500MB
              </p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoSelect}
            className="hidden"
          />
        </div>

        {/* Upload Form Section */}
        <div className="w-full lg:w-96 p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              maxLength={100}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {title.length}/100
            </div>
          </div>

          {/* Quote Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Scripture Quote</label>
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Add a scripture or inspirational quote..."
              className="w-full h-20 p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-purple-500"
              maxLength={200}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {quote.length}/200
            </div>
          </div>

          {/* Hashtags Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Hashtags
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="#Faith #Prayer #Gospel"
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
              maxLength={150}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {hashtags.length}/150
            </div>
          </div>

          {/* Tag Pastors */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Tag Pastors
            </label>
            <div className="space-y-2">
              {pastorsList.map((pastor) => (
                <label key={pastor} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={taggedPastors.includes(pastor)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setTaggedPastors(prev => [...prev, pastor])
                      } else {
                        setTaggedPastors(prev => prev.filter(p => p !== pastor))
                      }
                    }}
                    className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-white text-sm">{pastor}</span>
                </label>
              ))}
            </div>
            {taggedPastors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-400 mb-2">Tagged:</p>
                <div className="flex flex-wrap gap-2">
                  {taggedPastors.map((pastor) => (
                    <span key={pastor} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                      {pastor}
                      <button
                        onClick={() => setTaggedPastors(prev => prev.filter(p => p !== pastor))}
                        className="ml-2 hover:bg-purple-700 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Caption Input */}
          <div>
            <label className="block text-sm font-medium mb-2">Caption *</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your faith message..."
              className="w-full h-32 p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:border-purple-500"
              maxLength={500}
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {caption.length}/500
            </div>
          </div>

          {/* Hashtags Suggestions */}
          <div>
            <label className="block text-sm font-medium mb-2">Quick Add Hashtags</label>
            <div className="flex flex-wrap gap-2">
              {['#Faith', '#Prayer', '#Gospel', '#Blessed', '#Hope', '#Love'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setHashtags(prev => prev ? prev + ' ' + tag : tag)}
                  className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-full text-sm hover:border-purple-500 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">Privacy</label>
            <select className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500">
              <option value="public">Public - Everyone can see</option>
              <option value="followers">Followers only</option>
              <option value="private">Private - Only you</option>
            </select>
          </div>

          {/* Upload Guidelines */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Community Guidelines</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Share uplifting and faith-based content</li>
              <li>• Respect all community members</li>
              <li>• No inappropriate or offensive material</li>
              <li>• Keep videos under 60 seconds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}