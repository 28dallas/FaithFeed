'use client'

import { ArrowLeft, Users, Trash } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

const pastors: Pastor[] = [
  {
    id: 1,
    name: "Pastor Isaac Mwangi",
    title: "Senior Pastor",
    church: "Faith Community Church",
    location: "Nairobi, Kenya",
    phone: "+254 700 000 000",
    email: "mwangindengwaisaac@gmail.com",
    bio: "Leading the community with faith and dedication for over 15 years."
  },
  {
    id: 2,
    name: "Pastor David Johnson",
    title: "Youth Pastor",
    church: "Grace Fellowship",
    location: "Mombasa, Kenya",
    phone: "+254 700 000 001",
    email: "david@gracefellowship.org",
    bio: "Passionate about mentoring young people in their faith journey."
  },
  {
    id: 3,
    name: "Pastor Sarah Grace",
    title: "Women's Ministry Leader",
    church: "Hope Baptist Church",
    location: "Kisumu, Kenya",
    phone: "+254 700 000 002",
    email: "sarah@hopebaptist.org",
    bio: "Empowering women through biblical teachings and community support."
  }
]

export default function PastorsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pastorsList, setPastorsList] = useState<Pastor[]>(pastors)
  const [showAddForm, setShowAddForm] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [showEditPhoto, setShowEditPhoto] = useState<number | null>(null)
  const [newPhoto, setNewPhoto] = useState('')
  const [newPastor, setNewPastor] = useState({
    name: '',
    church: '',
    location: '',
    photo: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('faithfeed_user')
    if (!userData) {
      router.push('/login')
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setIsAdmin(parsedUser.email === 'mwangindengwaisaac@gmail.com' || parsedUser.email === 'breezydallas6@gmail.com' || parsedUser.role === 'admin')
    
    const savedPastors = localStorage.getItem('faithfeed_pastors')
    if (savedPastors) {
      setPastorsList(JSON.parse(savedPastors))
    }

    // Load videos to count sermons
    fetch('/api/videos')
      .then(res => res.json())
      .then((serverVideos: any[]) => {
        if (serverVideos) {
          setVideos(serverVideos)
        }
      })
      .catch(() => {})
  }, [router])

  const getSermonCount = (pastorId: number) => {
    return videos.filter(video => video.pastorId === pastorId).length
  }

  const updatePastorPhoto = (pastorId: number) => {
    if (!newPhoto) return
    
    const updatedPastors = pastorsList.map(pastor => {
      if (pastor.id === pastorId) {
        return { ...pastor, photo: newPhoto }
      }
      return pastor
    })
    
    setPastorsList(updatedPastors)
    localStorage.setItem('faithfeed_pastors', JSON.stringify(updatedPastors))
    setShowEditPhoto(null)
    setNewPhoto('')
  }

  const addPastor = () => {
    if (!newPastor.name.trim() || !newPastor.church.trim() || !newPastor.location.trim()) return
    
    const pastor: Pastor = {
      id: Date.now(),
      name: newPastor.name,
      title: 'Pastor',
      church: newPastor.church,
      location: newPastor.location,
      bio: '',
      photo: newPastor.photo
    }
    
    const updatedPastors = [...pastorsList, pastor]
    setPastorsList(updatedPastors)
    localStorage.setItem('faithfeed_pastors', JSON.stringify(updatedPastors))
    
    setNewPastor({ name: '', church: '', location: '', photo: '' })
    setShowAddForm(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pastors</h1>
        <p className="text-gray-600">Discover inspiring preachers and their messages</p>
      </div>

      <div className="px-6 pb-24">
        <div className="grid grid-cols-2 gap-6">
          {pastorsList.map((pastor) => (
            <button
              key={pastor.id}
              onClick={() => router.push(`/pastors/${pastor.id}`)}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center relative"
            >
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!confirm('Delete this pastor?')) return
                    const updated = pastorsList.filter(p => p.id !== pastor.id)
                    setPastorsList(updated)
                    localStorage.setItem('faithfeed_pastors', JSON.stringify(updated))
                  }}
                  className="absolute top-3 right-3 bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100 z-10"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
              
              <div className="relative mb-4">
                {pastor.photo ? (
                  <img 
                    src={pastor.photo} 
                    alt={pastor.name} 
                    className="w-20 h-20 rounded-full border-4 border-gray-100 object-cover" 
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-full border-4 border-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-600">{pastor.name.charAt(0)}</span>
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEditPhoto(pastor.id)
                    }}
                    className="absolute -bottom-1 -right-1 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-purple-700"
                  >
                    +
                  </button>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-lg mb-1">{pastor.name}</h3>
              <p className="text-purple-600 font-medium text-sm mb-1">{pastor.church}</p>
              <div className="flex items-center text-gray-500 text-xs mb-3">
                <span>📍 {pastor.location}</span>
              </div>
              
              <div className="bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-sm font-medium">
                📺 {getSermonCount(pastor.id)} sermons
              </div>
            </button>
          ))}
        </div>
      </div>

      {showEditPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Update Photo</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  setNewPhoto(reader.result as string)
                }
                reader.readAsDataURL(file)
              }}
              className="w-full mb-4"
            />
            {newPhoto && (
              <img src={newPhoto} alt="preview" className="w-20 h-20 rounded-full object-cover border mx-auto mb-4" />
            )}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEditPhoto(null)
                  setNewPhoto('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => updatePastorPhoto(showEditPhoto)}
                disabled={!newPhoto}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Add New Pastor</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Pastor Name *"
                value={newPastor.name}
                onChange={(e) => setNewPastor(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Church *"
                value={newPastor.church}
                onChange={(e) => setNewPastor(prev => ({ ...prev, church: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Location *"
                value={newPastor.location}
                onChange={(e) => setNewPastor(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files && e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = () => {
                      setNewPastor(prev => ({ ...prev, photo: reader.result as string }))
                    }
                    reader.readAsDataURL(file)
                  }}
                  className="w-full"
                />
                {newPastor.photo && (
                  <img src={newPastor.photo} alt="preview" className="mt-3 w-28 h-28 rounded-full object-cover border" />
                )}
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addPastor}
                disabled={!newPastor.name.trim() || !newPastor.church.trim() || !newPastor.location.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
              >
                Add Pastor
              </button>
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="fixed bottom-20 right-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700"
          >
            <Users className="w-6 h-6" />
          </button>
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex items-center justify-around py-3">
          <button onClick={() => router.push('/')} className="flex flex-col items-center space-y-1 text-gray-600">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">Feeds</span>
          </button>
          
          <div className="flex flex-col items-center space-y-1 text-purple-600">
            <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs font-medium">Pastors</span>
          </div>
          
          <button className="flex flex-col items-center space-y-1 text-gray-600">
            <div className="w-6 h-6 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">Saved</span>
          </button>
        </div>
      </div>
    </div>
  )
}