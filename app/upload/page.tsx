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
  const [caption, setCaption] = useState('')
  const [taggedPastors, setTaggedPastors] = useState<string[]>([])
  const [selectedPastorId, setSelectedPastorId] = useState<number | null>(null)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [pastorsList, setPastorsList] = useState<any[]>([])
  const [topics, setTopics] = useState<string[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    console.log('Upload page - User data:', parsedUser) // Debug log
    // Check if user is Pastor Isaac Mwangi (admin)
    const adminCheck = parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin'
    console.log('Upload page - Admin check result:', adminCheck) // Debug log
    setIsAdmin(adminCheck)
    
    if (!adminCheck) {
      router.push('/')
      return
    }

    // Load pastors list
    const savedPastors = localStorage.getItem('faithfeed_pastors')
    if (savedPastors) {
      setPastorsList(JSON.parse(savedPastors))
    }

    // Load topics list
    const savedTopics = localStorage.getItem('faithfeed_topics')
    if (savedTopics) {
      const allTopics = JSON.parse(savedTopics)
      setTopics(allTopics.filter((topic: string) => topic !== 'All Topics'))
    } else {
      setTopics(['Prayer', 'Love', 'Worship', 'Grace', 'Purpose', 'Faith', 'Hope', 'Healing', 'Salvation', 'Family'])
    }
  }, [router])

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      // Check file size (4MB limit for Vercel deployment)
      const maxSize = 4 * 1024 * 1024 // 4MB in bytes
      if (file.size > maxSize) {
        alert('Video file is too large. Please select a video under 4MB for deployment.')
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

    try {
      const filename = `${Date.now()}-${selectedVideo.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      console.log('Uploading with filename:', filename)
      
      const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, {
        method: 'POST',
        body: selectedVideo,
      })
      
      console.log('Upload response status:', uploadRes.status)
      
      if (!uploadRes.ok) {
        const errorData = await uploadRes.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${uploadRes.status}`)
      }
      
      const { videoUrl } = await uploadRes.json()
      console.log('Video uploaded successfully:', videoUrl)

      const newVideo = {
        id: Date.now(),
        creator: user.name || user.email.split('@')[0],
        handle: `@${user.name?.replace(/\s+/g, '') || user.email.split('@')[0]}`,
        title: title.trim(),
        caption: caption,
        likes: 0,
        comments: [],
        shares: 0,
        videoUrl: videoUrl,
        isLiked: false,
        category: 'Sermon',
        duration: 0,
        views: 0,
        isSaved: false,
        pastorId: selectedPastorId,
        topic: selectedTopic
      }

      // POST to server API to persist globally
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVideo)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to save video data')
      }

      setIsUploading(false)
      router.push('/')
    } catch (err) {
      console.error('Upload error:', err)
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Please try again.'}`)
      setIsUploading(false)
    }
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
          disabled={!selectedVideo || !title.trim() || !caption.trim() || !selectedTopic || isUploading}
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
                MP4, MOV, AVI up to 4MB
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

          {/* Topic Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Topic *</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a topic</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Pastor */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Tag Pastor
            </label>
            <select
              value={selectedPastorId || ''}
              onChange={(e) => setSelectedPastorId(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a pastor (optional)</option>
              {pastorsList.map((pastor) => (
                <option key={pastor.id} value={pastor.id}>
                  {pastor.name}
                </option>
              ))}
            </select>
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
                  onClick={() => setCaption(prev => prev ? prev + ' ' + tag : tag)}
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
              <li>• Keep videos under 4MB for deployment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}