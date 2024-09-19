'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, firestore } from '@/firebase/firebase'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import Event from '@/components/Events/Event'
import { Input } from "@/components/ui/input"
import StudentForm from '@/components/form/StudentForm'
import { collection, getDocs } from 'firebase/firestore'
import { DocumentData } from 'firebase/firestore'
import { Badge } from "@/components/ui/badge"

interface Event extends DocumentData {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  showDeleteButton: boolean;
}

const Page = () => {
    const [user, setUser] = useState<User | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [events, setEvents] = useState<Event[]>([])
    const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
    const [formFilled, setFormFilled] = useState<boolean>(false)

    // const TotalEvents = [{
    //     title: 'Science Fair 2023',
    //     description: 'Annual science exhibition for students',
    //     date: 'October 15, 2023',
    //     time: '10:00 AM - 4:00 PM',
    //     location: 'School Auditorium'
    // },
    // {
    //     title: 'Science Fair 2024',
    //     description: 'Annual science exhibition for students',
    //     date: 'October 15, 2024',
    //     time: '10:00 AM - 4:00 PM',
    //     location: 'School Auditorium'
    //     },
    //     {
    //         title: 'book 2025',
    //         description: 'Annual book exhibition for students',
    //         date: 'October 15, 2025',
    //         time: '10:00 AM - 4:00 PM',
    //         location: 'School Auditorium'
    //     },
    //     {
    //         title: 'book 2026',
    //         description: 'Annual book exhibition for students',
    //         date: 'October 15, 2026',
    //         time: '10:00 AM - 4:00 PM',
    //         location: 'School Auditorium'
    //     },
    //     { title: 'book 2027',
    //         description: 'Annual book exhibition for students',
    //         date: 'October 15, 2027',
    //         time: '10:00 AM - 4:00 PM',
    //         location: 'School Auditorium'
    //     }
    // ]

    const fetchEvents = async () => {
        const eventsCollection = collection(firestore, 'events')
        const eventsSnapshot = await getDocs(eventsCollection)
        const eventsList = eventsSnapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            description: doc.data().description,
            date: doc.data().date,
            time: doc.data().time,
            location: doc.data().location
        } as Event))
        setEvents(eventsList)
        setFilteredEvents(eventsList)
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid))
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === 'student') {
                        setUser(user)
                        setUsername(`${userData.firstName} ${userData.lastName}`)
                        setFormFilled(userData.formFilled || false)  // Set formFilled based on Firestore data
                        await fetchEvents()  // Fetch events after user is authenticated
                    } else {
                        router.push('/admindashboard')
                    }
                } else {
                    router.push('/login')
                }
            } else {
                router.push('/login')
            }
            setLoading(false)
        });
        return () => unsubscribe()
    }, [router])

    useEffect(() => {
        const filtered = events.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredEvents(filtered)
    }, [searchTerm, events])

    if (loading) {
        return <div className="flex items-center justify-center h-screen text-2xl font-semibold">Loading... Dashboard</div>
    }

    return (
        <div className="container mx-auto p-3 lg:p-6 flex flex-col h-screen gap-6 
      ">
        {user && formFilled && (
          <div className="w-full text-center mb-2">
            <Badge variant="outline" className=" shadow-md tracking-wider border-green-300 border font-semibold capitalize text-md ">Form Submitted</Badge>
          </div>
        )}
        <div className={`flex lg:justify-center lg:items-center flex-col lg:flex-row h-full lg:gap-10 gap-5 ${formFilled ? 'justify-center ' : ''}`}>
          <div className={`flex flex-col h-full ${formFilled ? 'lg:w-1/3' : 'w-full  lg:w-1/3 '}`}>
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-2xl mb-2">Events</CardTitle>
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <div className="h-full overflow-y-auto pr-2">
                  {filteredEvents.length === 0 ? (  // Check if there are no events
                      <div className="text-center text-lg font-semibold">No events going on.</div>  // Message for no events
                  ) : (
                      filteredEvents.map((event, index) => (
                          <div key={index} className="mb-4 last:mb-0">
                              <Event
                                  title={event.title}
                                  description={event.description}
                                  date={event.date}
                                  time={event.time}
                                  location={event.location}
                                  showDeleteButton={false}
                              />
                          </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {user && !formFilled && (
            <div className="w-full lg:w-1/2 flex flex-col h-full">
              <Card className="flex flex-col h-full">
                <CardHeader>
                  <CardTitle className="text-2xl mb-2">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                  <StudentForm />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
}

export default Page

