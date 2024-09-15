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

const Page = () => {
    const [user, setUser] = useState<User | null>(null)
    const [username, setUsername] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    

    const TotalEvents = [{
        title: 'Science Fair 2023',
        description: 'Annual science exhibition for students',
        date: 'October 15, 2023',
        time: '10:00 AM - 4:00 PM',
        location: 'School Auditorium'
    },
    {
        title: 'Science Fair 2024',
        description: 'Annual science exhibition for students',
        date: 'October 15, 2024',
        time: '10:00 AM - 4:00 PM',
        location: 'School Auditorium'
        },
        {
            title: 'book 2025',
            description: 'Annual book exhibition for students',
            date: 'October 15, 2025',
            time: '10:00 AM - 4:00 PM',
            location: 'School Auditorium'
        },
        {
            title: 'book 2026',
            description: 'Annual book exhibition for students',
            date: 'October 15, 2026',
            time: '10:00 AM - 4:00 PM',
            location: 'School Auditorium'
        }
    ]
const [filteredEvents, setFilteredEvents] = useState(TotalEvents);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user)
                const userDoc = await getDoc(doc(firestore, 'users', user.uid))
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUsername(`${userData?.firstName} ${userData?.lastName}`)
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
        const filtered = TotalEvents.filter(event =>
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredEvents(filtered)
    }, [searchTerm])

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>
    }

    return (
      <div className="container mx-auto p-4 md:p-6 flex flex-col md:flex-row min-h-screen">
        <div className="w-full md:w-1/3 md:pr-4 mb-4 md:mb-0">
            <Card>
                <CardHeader>
                    <CardTitle>Events</CardTitle>
                    <Input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-2"
                    />
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] md:max-h-[calc(100vh-300px)] overflow-x-auto md:overflow-x-visible overflow-y-auto">
                    <div className="flex flex-row md:flex-col">
                        {filteredEvents.map((event, index) => (
                            <div key={index} className="flex-shrink-0 w-64 md:w-full mr-4 md:mr-0">
                                <Event
                                    title={event.title}
                                    description={event.description}
                                    date={event.date}
                                    time={event.time}
                                    location={event.location}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="w-full md:w-2/3 md:pl-4">
            {/* Add your main content here */}
           
                
                  
                    
                    <StudentForm />
               
            
        </div>
      </div>
    );
}

export default Page

