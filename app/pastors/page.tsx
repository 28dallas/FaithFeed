'use client'

import { ArrowLeft, Users, MapPin, Phone, Mail, Plus } from 'lucide-react'
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
    bio: ''
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

      <div className="p-4 space-y-4">
        {pastorsList.map((pastor) => (
          <div key={pastor.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-transparent border-2 border-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-gray-600 font-bold text-xl">
                  {pastor.name.charAt(0)}
                </span>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{pastor.name}</h3>
                <p className="text-purple-600 font-medium">{pastor.title}</p>
                <p className="text-gray-600 font-medium">{pastor.church}</p>
                
                <div className="flex items-center text-gray-500 text-sm mt-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {pastor.location}
                </div>

                <p className="text-gray-700 text-sm mt-3 leading-relaxed">{pastor.bio}</p>

                <div className="flex flex-wrap gap-4 mt-4">
                  {pastor.phone && (
                    <a 
                      href={`tel:${pastor.phone}`}
                      className="flex items-center text-blue-600 text-sm hover:underline"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      {pastor.phone}
                    </a>
                  )}
                  {pastor.email && (
                    <a 
                      href={`mailto:${pastor.email}`}
                      className="flex items-center text-blue-600 text-sm hover:underline"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      {pastor.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
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