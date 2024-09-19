"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleX } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Event from "@/components/Events/Event";
import { User } from "firebase/auth";
import { LogOut } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"; // Import necessary components
import { useMemo } from "react"; // Import useMemo for performance optimization

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  showDeleteButton: boolean;
}

const TeacherDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "teacher") {
              setUser(user);
              setUsername(`${userData.firstName} ${userData.lastName}`);
              fetchEvents();
            } else {
              console.log("User is not a teacher, redirecting to dashboard");
              router.push("/dashboard");
            }
          } else {
            console.log("User document does not exist, redirecting to login");
            router.push("/login");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          router.push("/login");
        }
      } else {
        console.log("No user logged in, redirecting to login");
        router.push("/login");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent the default form submission
    try {
      await addDoc(collection(firestore, "events"), newEvent);
      fetchEvents();
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
      });
    } catch (error) {
      console.error("Error adding event: ", error);
    }
  };

  const fetchEvents = async () => {
    try {
      const eventsCollection = collection(firestore, "events");
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId); // Set the event ID to delete
    setOpen(true); // Open the alert dialog
  };

  const handleDeleteConfirmed = async () => {
    if (eventToDelete) { // Ensure eventToDelete is not null
      try {
        await deleteDoc(doc(firestore, "events", eventToDelete));
        fetchEvents(); // Refresh the events list
        setOpen(false); // Close the dialog after deletion
        setEventToDelete(null); // Reset the eventToDelete state
      } catch (error) {
        console.error("Error deleting event: ", error);
      }
    }
  };

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    return events.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) || // Filter by title
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) // Filter by location
    );
  }, [events, searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-background border-b">
        <div className="container mx-auto py-3 md:py-4 px-4 md:px-6 flex justify-between items-center">
          <h1 className="text-md md:text-xl font-semibold text-nowrap md:tracking-normal tracking-tighter ">
            Teacher Dashboard
          </h1>
          <div className="flex items-center space-x-1">
            <span className="text-muted-foreground text-sm md:text-base ">
         
              <span className="font-semibold hidden md:inline-block">Welcome</span> {username}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 lg:p-6 flex flex-col lg:flex-row gap-0 md:gap-6">
        <div className="w-full lg:w-1/3 mb-6 lg:mb-0 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl  mb-0 md:mb-2 ">Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3 md:space-y-4" onSubmit={handleCreateEvent}> 
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
                  placeholder="Event Date"
                  type="date"
                  name="date"
                  value={newEvent.date}
                  onChange={handleInputChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                <Input
                  placeholder="Event Time"
                  type="time"
                  name="time"
                  value={newEvent.time}
                  onChange={handleInputChange}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                />
                <Input
                  type="text"
                  name="location"
                  placeholder="Event Location"
                  value={newEvent.location}
                  onChange={handleInputChange}
                />
                <Button onClick={()=>handleCreateEvent}>Create Event</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3 flex flex-col h-full">
          <Card className="flex flex-col h-full">
            <CardHeader>
              <CardTitle className="text-2xl mb-0 md:mb-2">Created Events</CardTitle>
              <Input
                type="text"
                placeholder="Search Events by Title or Location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} // Update search query
                className="mb-0 md:mb-4" // Add margin for spacing
              />
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto h-64 scrollbar-hidden">
              {filteredEvents.length === 0 ? ( // Check if there are no filtered events
                <div className="text-center text-gray-500">No Events found!</div> // Display message if no results
              ) : (
                filteredEvents.map((event, index) => (
                  <div
                    key={index}
                    className="mb-2 md:mb-4 last:mb-0 flex justify-between items-center  "
                  >
                    <Event
                      title={event.title}
                      description={event.description}
                      date={event.date}
                      time={event.time}
                      location={event.location}
                      showDeleteButton={true}
                      onDelete={() => handleDeleteEvent(event.id)} // Pass delete function
                    />
                    <AlertDialog open={open} onOpenChange={setOpen}>
                      <AlertDialogTrigger asChild>
                        {/* Trigger button for alert dialog */}
                      </AlertDialogTrigger>
                      <AlertDialogContent className="w-[90%] rounded-md">
                        <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this event?
                        </AlertDialogDescription>
                        <div className="flex justify-end items-center gap-2 ">
                          <AlertDialogCancel
                            className="m-0"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={handleDeleteConfirmed} // Call the confirmed delete function
                          >
                            Delete
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
