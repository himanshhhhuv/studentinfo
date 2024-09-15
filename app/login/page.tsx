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
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
                router.push('/dashboard')
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
                // Retrieve user data from local storage
                const registrationData = localStorage.getItem('registrationData');
                const { firstName = '', lastName = '', phoneNumber = '' } = registrationData ? JSON.parse(registrationData) : {};
              
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                if (!userDoc.exists()) {
                    // Save user data to Firestore
                    await setDoc(doc(firestore, 'users', user.uid), {
                        firstName,
                        lastName,
                        phoneNumber,
                        email: user.email,
                    });
                }
                router.push('/dashboard');
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
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[360px] md:w-[450px] h-[500px]">
          {" "}
          {/* Increased height to accommodate new link */}
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Login</CardTitle>
            <CardDescription className="text-sm text-gray-500 font-semibold">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="email" className="text-m font-semibold">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
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
              </div>
              <Button className="w-full mt-4" type="submit">
                Login
              </Button>
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-md text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="mt-4 text-md text-gray-600 font-semibold">
              Don't have an account?
            </p>
            <Button className="mt-2 w-full bg-blue-600 hover:bg-blue-700">
              <Link href="/register" className="text-white text-md w-full font-semibold">
               Sign Up
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
}

export default Login