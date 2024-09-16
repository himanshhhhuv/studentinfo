'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, firestore } from '@/firebase/firebase'
import { doc, getDoc, collection, addDoc, getDocs } from 'firebase/firestore'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Event from '@/components/Events/Event'
import { User } from 'firebase/auth'

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
}

const TeacherDashboard = () => {
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: ''
  })
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.role === 'teacher') {
              setUser(user)
              setUsername(`${userData.firstName} ${userData.lastName}`)
              fetchEvents()
            } else {
              console.log('User is not a teacher, redirecting to dashboard')
              router.push('/dashboard')
            }
          } else {
            console.log('User document does not exist, redirecting to login')
            router.push('/login')
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          router.push('/login')
        }
      } else {
        console.log('No user logged in, redirecting to login')
        router.push('/login')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewEvent(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateEvent = async () => {
    try {
      await addDoc(collection(firestore, 'events'), newEvent)
      fetchEvents()
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        location: ''
      })
    } catch (error) {
      console.error("Error adding event: ", error)
    }
  }

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(firestore, 'events')
      const eventsSnapshot = await getDocs(eventsCollection)
      const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Event[]
      setEvents(eventsList)
    } catch (error) {
      console.error("Error fetching events: ", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (error) {
      console.error("Error signing out: ", error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-muted-foreground">Welcome, {username}</span>
            <Button variant="outline" onClick={handleLogout}>Logout</Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 mb-6 lg:mb-0 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={handleInputChange}
                />
                <Input
                  type="text"
                  name="description"
                  placeholder="Event Description"
                  value={newEvent.description}
                  onChange={handleInputChange}
                />
                <Input
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                />
                <Input
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                />
                <Input
                  type="text"
                  name="location"
                  placeholder="Event Location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                />
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl mb-2">Created Events</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <Event
                    title={event.title}
                    description={event.description}
                    date={event.date}
                    time={event.time}
                    location={event.location}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard