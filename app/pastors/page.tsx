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
  const [newPastor, setNewPastor] = useState({
    name: '',
    title: '',
    church: '',
    location: '',
    phone: '',
    email: '',
    bio: '',
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
  }, [router])

  const addPastor = () => {
    if (!newPastor.name.trim() || !newPastor.title.trim()) return
    
    const pastor: Pastor = {
      id: Date.now(),
      ...newPastor
    }
    
    const updatedPastors = [...pastorsList, pastor]
    setPastorsList(updatedPastors)
    localStorage.setItem('faithfeed_pastors', JSON.stringify(updatedPastors))
    
    setNewPastor({ name: '', title: '', church: '', location: '', phone: '', email: '', bio: '' })
    setShowAddForm(false)
  }

  if (!user) return null

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
          <h1 className="text-xl font-bold">Pastors</h1>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {pastorsList.map((pastor) => (
            <button
              key={pastor.id}
              onClick={() => router.push(`/pastors/${pastor.id}`)}
              className="relative bg-white rounded-2xl shadow-sm border p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow"
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
                  className="absolute top-3 right-3 bg-red-50 text-red-600 p-2 rounded-full hover:bg-red-100"
                  aria-label={`Delete ${pastor.name}`}
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
              {pastor.photo ? (
                <img src={pastor.photo} alt={pastor.name} className="w-24 h-24 rounded-full border-2 border-gray-200 object-cover" />
              ) : (
                <div className="w-24 h-24 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                  <span className="text-2xl font-bold text-gray-800">{pastor.name.charAt(0)}</span>
                </div>
              )}

              <h3 className="mt-4 text-base font-semibold text-gray-900">{pastor.name}</h3>
              <p className="text-sm text-purple-600">{pastor.title}</p>
              <p className="text-xs text-gray-500 mt-1">{pastor.church}</p>
            </button>
          ))}
        </div>
      </div>

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
                placeholder="Title *"
                value={newPastor.title}
                onChange={(e) => setNewPastor(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Church"
                value={newPastor.church}
                onChange={(e) => setNewPastor(prev => ({ ...prev, church: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Location"
                value={newPastor.location}
                onChange={(e) => setNewPastor(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newPastor.phone}
                onChange={(e) => setNewPastor(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newPastor.email}
                onChange={(e) => setNewPastor(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                placeholder="Bio"
                value={newPastor.bio}
                onChange={(e) => setNewPastor(prev => ({ ...prev, bio: e.target.value }))}
                className="w-full p-3 border rounded-lg h-20 resize-none"
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
                disabled={!newPastor.name.trim() || !newPastor.title.trim()}
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
    </div>
  )
}