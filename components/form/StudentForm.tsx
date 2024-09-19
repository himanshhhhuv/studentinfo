'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { firestore, auth } from '@/firebase/firebase' // Ensure this path is correct
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore'

const StudentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    enrollment: '',
    program: '',
    semester: '',
    section: '',
    gender: '',
    club: 'default',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (value: string, field: string) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Add student info to 'studentinfo' collection
      await addDoc(collection(firestore, 'studentinfo'), formData)

      // Update user's document
      const userId = auth.currentUser?.uid
      if (userId) {
        await updateDoc(doc(firestore, 'users', userId), {
          formFilled: true
        })
      }

      toast({
        title: "Form submitted successfully",
        description: "Your information has been saved.",
      })

      // Refresh the page after successful submission
      window.location.reload()
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "There was a problem submitting your form. Please try again.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Student Registration</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Student Name</Label>
              <Input id="name" placeholder="Enter student name" value={formData.name} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollment">Enrollment Number</Label>
              <Input id="enrollment" placeholder="Enter enrollment number" value={formData.enrollment} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select onValueChange={(value) => handleSelectChange(value, 'program')}>
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="ee">Electrical Engineering</SelectItem>
                  <SelectItem value="me">Mechanical Engineering</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select onValueChange={(value) => handleSelectChange(value, 'semester')}>
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input id="section" placeholder="Enter section" value={formData.section} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select onValueChange={(value) => handleSelectChange(value, 'gender')}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="club">Club Name</Label>
              <Input id="club" placeholder="Enter club name" />
            </div> */}
          </div>
          <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default StudentForm