'use client'

import { ArrowLeft, Users, Heart, MessageCircle, Share2, UserPlus, UserMinus, Edit, Camera, Save, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string
  handle: string
  email: string
  bio: string
  followers: number
  following: number
  isFollowing: boolean
  profilePicture?: string
  coverPhoto?: string
  videosCount: number
}

export default function ProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({})
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Resolve params promise
    params.then(resolvedParams => {
      setUserId(resolvedParams.userId)
    })
  }, [params])

  useEffect(() => {
    if (!userId) return
    
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      router.push('/login')
      return
    }
    const currentUser = JSON.parse(userData)
    setUser(currentUser)

    // Mock profile data - in real app, fetch from API
    const mockProfile: UserProfile = {
      id: userId,
      name: userId === 'pastor-isaac' ? 'Pastor Isaac Mwangi' : 'Sarah Grace',
      handle: userId === 'pastor-isaac' ? '@PastorIsaac' : '@SarahGrace',
      email: userId === 'pastor-isaac' ? 'mwangindengwaisaac@gmail.com' : 'sarah@example.com',
      bio: userId === 'pastor-isaac' 
        ? 'Senior Pastor at Faith Community Church. Spreading God\'s love through digital ministry. 🙏' 
        : 'Faith blogger and worship leader. Sharing daily inspiration and biblical truths. ✨',
      followers: userId === 'pastor-isaac' ? 12400 : 8900,
      following: userId === 'pastor-isaac' ? 234 : 456,
      isFollowing: false,
      videosCount: userId === 'pastor-isaac' ? 45 : 23
    }
    
    setProfile(mockProfile)
    setIsOwnProfile(currentUser.email === mockProfile.email)
  }, [userId, router])

  const handleFollow = () => {
    if (!profile) return
    setProfile({
      ...profile,
      isFollowing: !profile.isFollowing,
      followers: profile.isFollowing ? profile.followers - 1 : profile.followers + 1
    })
  }

  const handleEditProfile = () => {
    setIsEditing(true)
    setEditedProfile({
      name: profile?.name,
      bio: profile?.bio,
      profilePicture: profile?.profilePicture
    })
  }

  const handleSaveProfile = () => {
    if (!profile || !user) return

    const updatedProfile = {
      ...profile,
      ...editedProfile
    }

    setProfile(updatedProfile)

    // Save to localStorage
    const savedProfiles = JSON.parse(localStorage.getItem('faithfeed_profiles') || '{}')
    savedProfiles[user.email] = updatedProfile
    localStorage.setItem('faithfeed_profiles', JSON.stringify(savedProfiles))

    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedProfile({})
  }

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setEditedProfile(prev => ({ ...prev, profilePicture: imageUrl }))
      }
      reader.readAsDataURL(file)
    }
  }

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
    return count.toString()
  }

  if (!user || !profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{profile.name}</h1>
            <p className="text-sm text-gray-500">{profile.videosCount} videos</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-r from-blue-500 to-teal-500 relative">
        {profile.coverPhoto && (
          <img src={profile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Profile Info */}
      <div className="bg-white px-4 pb-4">
        {/* Profile Picture */}
        <div className="relative -mt-16 mb-4">
          <div className="w-32 h-32 bg-gray-300 rounded-full border-4 border-white overflow-hidden flex items-center justify-center relative">
            {isEditing ? (
              <>
                {editedProfile.profilePicture ? (
                  <img src={editedProfile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                ) : profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-600">
                    {profile.name.charAt(0)}
                  </span>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-600">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </div>

        {/* Name and Handle */}
        <div className="mb-4">
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.name || ''}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
              className="text-2xl font-bold w-full border-b border-gray-300 focus:border-purple-500 outline-none"
              placeholder="Enter your name"
            />
          ) : (
            <h2 className="text-2xl font-bold">{profile.name}</h2>
          )}
          <p className="text-gray-600">{profile.handle}</p>
        </div>

        {/* Bio */}
        {isEditing ? (
          <textarea
            value={editedProfile.bio || ''}
            onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="text-gray-800 mb-4 leading-relaxed w-full border border-gray-300 rounded-lg p-2 focus:border-purple-500 outline-none resize-none"
            rows={3}
            placeholder="Tell us about yourself..."
          />
        ) : (
          <p className="text-gray-800 mb-4 leading-relaxed">{profile.bio}</p>
        )}

        {/* Stats */}
        <div className="flex space-x-6 mb-4">
          <div className="text-center">
            <div className="font-bold text-lg">{formatCount(profile.following)}</div>
            <div className="text-gray-600 text-sm">Following</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{formatCount(profile.followers)}</div>
            <div className="text-gray-600 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg">{formatCount(profile.videosCount)}</div>
            <div className="text-gray-600 text-sm">Videos</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isOwnProfile && isAdmin ? (
            isEditing ? (
              <>
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleEditProfile}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            )
          ) : isOwnProfile ? (
            <button className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium">
              Edit Profile (Admin Only)
            </button>
          ) : (
            <>
              <button
                onClick={handleFollow}
                className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                  profile.isFollowing
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-purple-600 text-white'
                }`}
              >
                {profile.isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
              <button className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium">
                Message
              </button>
            </>
          )}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="bg-white mt-2 p-4">
        <h3 className="text-lg font-semibold mb-4">Videos</h3>
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">Video {i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}