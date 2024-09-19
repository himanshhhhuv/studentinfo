import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, Trash } from "lucide-react"

interface EventProps {
  title: string
  description: string
  date: string
  time: string
  location: string
  showDeleteButton?: boolean;
  onDelete?: () => void; // Added prop for delete action
}

const Event: React.FC<EventProps> = ({ title, description, date, time, location, showDeleteButton, onDelete }) => {
  return (
    <Card className="w-full max-w-md relative">
      {showDeleteButton && ( 
        <Button className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 border border-red-400 hover:border-red-500" variant="outline" onClick={onDelete}> {/* Call onDelete when clicked */}
          <Trash className="h-4 w-4 text-red-500 hover:text-red-600 " />
        </Button>
      )}
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <Clock className="h-4 w-4" />
          <span>{time}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Register</Button>
      </CardFooter>
    </Card>
  )
}

export default Event