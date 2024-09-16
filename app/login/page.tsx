'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth, firestore } from '@/firebase/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    switch (userData.role) {
                        case 'teacher':
                            router.replace('/teacherdashboard');
                            break;
                        case 'admin':
                            router.replace('/admindashboard');
                            break;
                        case 'student':
                        default:
                            router.replace('/dashboard');
                            break;
                    }
                }
            }
        })

        // Cleanup the subscription on unmount
        return () => unsubscribe()
    }, [router])

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault()
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user.emailVerified) {
                let userDoc = await getDoc(doc(firestore, 'users', user.uid));
                
                if (!userDoc.exists()) {
                    // Retrieve user data from local storage
                    const registrationData = localStorage.getItem('registrationData');
                    const { firstName = '', lastName = '', phoneNumber = '' } = registrationData ? JSON.parse(registrationData) : {};
                    
                    // Save user data to Firestore with role as "student"
                    await setDoc(doc(firestore, 'users', user.uid), {
                        firstName,
                        lastName,
                        phoneNumber,
                        email: user.email,
                        role: 'student',
                    });
                    
                    // Fetch the user document again to get the updated data
                    userDoc = await getDoc(doc(firestore, 'users', user.uid));
                }
                
                // Check user role and redirect accordingly
                const userData = userDoc.data();
                if (userData) {
                    // Add a small delay before navigation
                    setTimeout(() => {
                        switch (userData.role) {
                            case 'teacher':
                                router.replace('/teacherdashboard');
                                break;
                            case 'admin':
                                router.replace('/admindashboard');
                                break;
                            case 'student':
                            default:
                                router.replace('/dashboard');
                                break;
                        }
                    }, 100); // 100ms delay
                } else {
                    // If userData doesn't exist (which shouldn't happen at this point), default to student dashboard
                    setTimeout(() => {
                        router.replace('/dashboard');
                    }, 100);
                }
            } else {
                setError('Please verify your email before logging in');
            }
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('An unknown error occurred');
            }
        }
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <Card className="w-full max-w-[400px]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button className="w-full" type="submit">
                Login
              </Button>
            </form>
            <div className="mt-4 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?
            </p>
            <Button variant="outline" className="w-full">
              <Link href="/register" className="w-full">
               Sign Up
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
}

export default Login