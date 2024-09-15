'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/firebase/firebase'
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const Page = () => {
	const router = useRouter()
	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')
	const [authChecked, setAuthChecked] = useState(false)

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				router.push('/login') // Redirect to login if not authenticated
			} else {
				setAuthChecked(true)
			}
		})

		return () => unsubscribe()
	}, [router])

	const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setError('')
		setMessage('')
		setLoading(true)

		if (newPassword !== confirmPassword) {
			setError('New password and confirm password do not match')
			setLoading(false)
			return
		}

		try {
			const user = auth.currentUser
			if (user && user.email) {
				const credential = EmailAuthProvider.credential(user.email, currentPassword)
				await reauthenticateWithCredential(user, credential)
				await updatePassword(user, newPassword)
				setMessage('Password updated successfully')
				router.push('/dashboard') // Redirect to dashboard
			} else {
				setError('User not logged in')
			}
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message)
			} else {
				setError('Failed to update password')
			}
		} finally {
			setLoading(false)
		}
	}

	if (!authChecked) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p>Loading...</p>
			</div>
		)
	}

	return (
		<div className="container mx-auto mt-10 p-4">
			<Card className="max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Change Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleChangePassword} className="space-y-4">
						<Input
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							placeholder="Current Password"
							required
						/>
						<Input
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							placeholder="New Password"
							required
						/>
						<Input
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							placeholder="Confirm New Password"
							required
						/>
						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? 'Changing Password...' : 'Change Password'}
						</Button>
					</form>
					{error && (
						<Alert variant="destructive" className="mt-4">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					)}
					{message && (
						<Alert variant="success" className="mt-4">
							<AlertDescription>{message}</AlertDescription>
						</Alert>
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default Page