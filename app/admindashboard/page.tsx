"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, deleteDoc } from "firebase/firestore";
import { UserRound } from "lucide-react";
import UserTable from "@/components/admin/UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User } from "firebase/auth";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordResetEmail } from "firebase/auth";

// Update the FirestoreUser type to match the User interface in UserTable
type FirestoreUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: 'student' | 'teacher' | 'admin';
};

const AdminDashboard = () => {
	const { toast } = useToast();
	const router = useRouter();

	const [user, setUser] = useState<User | null>(null);
	const [username, setUsername] = useState("");
	const [error, setError] = useState("");
	const [users, setUsers] = useState<FirestoreUser[]>([]);
	const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
	const [pendingRoleChange, setPendingRoleChange] = useState<{
		userId: string;
		newRole: 'student' | 'teacher' | 'admin';
	} | null>(null);
	const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
	const [resetPasswordEmail, setResetPasswordEmail] = useState("");
	const [isResetPasswordCooldown, setIsResetPasswordCooldown] = useState(false);
	const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (user) => {
			if (user) {
				setUser(user);
				const userDoc = await getDoc(doc(firestore, "users", user.uid));
				if (userDoc.exists()) {
					const userData = userDoc.data();
					switch (userData.role) {
						case "admin":
							setUsername(`${userData.firstName} ${userData.lastName}`);
							break;
						case "teacher":
							router.push("/teacherdashboard");
							break;
						case "student":
							router.push("/dashboard");
							break;
						default:
							setError("Invalid user role.");
							setTimeout(() => router.push("/login"), 3000);
					}
				} else {
					setError("User data not found.");
					setTimeout(() => router.push("/login"), 3000);
				}
			} else {
				router.push("/login");
			}
		});

		// Add real-time listener for users collection
		const unsubscribeUsers = onSnapshot(query(collection(firestore, "users")), (snapshot) => {
			const updatedUsers = snapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data()
			})) as FirestoreUser[];
			setUsers(updatedUsers);
		});

		return () => {
			unsubscribe();
			unsubscribeUsers();
		};
	}, [router]);

	const handleLogout = async () => {
		try {
			await signOut(auth);
			router.push("/login");
		} catch (error) {
			console.error("Error signing out:", error);
			setError("Failed to log out. Please try again.");
		}
	};

	const handleRoleChange = (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
		setPendingRoleChange({ userId, newRole });
		setIsConfirmDialogOpen(true);
	};

	const confirmRoleChange = async () => {
		if (!pendingRoleChange) return;

		try {
			const userRef = doc(firestore, "users", pendingRoleChange.userId);
			await updateDoc(userRef, { role: pendingRoleChange.newRole });

			// Manually update the local state
			setUsers(prevUsers => prevUsers.map(user => 
				user.id === pendingRoleChange.userId 
					? { ...user, role: pendingRoleChange.newRole } 
					: user
			));

			setIsConfirmDialogOpen(false);
			setPendingRoleChange(null);
		} catch (error) {
			console.error("Error changing user role:", error);
			setError("Failed to change user role. Please try again.");
		}
	};

	const handleCreateUser = () => {
		// Implement user creation logic
	};

	const handleEditUser = (user: FirestoreUser) => {
		// Implement user editing logic
	};

	const handleDeleteUser = useCallback((userId: string, userEmail: string) => {
		setUserToDelete({ id: userId, email: userEmail });
		setIsDeleteUserDialogOpen(true);
	}, []);

	const confirmDeleteUser = useCallback(async () => {
		if (!userToDelete) return;

		try {
			const response = await fetch('/api/deleteUser', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ userId: userToDelete.id }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || 'Failed to delete user from Authentication');
			}

			// Continue with deleting from Firestore and updating state
			await deleteDoc(doc(firestore, "users", userToDelete.id));

			setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete.id));

			toast({
				title: "User Deleted",
				description: `User ${userToDelete.email} has been successfully deleted from both Authentication and database.`,
				duration: 5000,
			});

			setIsDeleteUserDialogOpen(false);
			setUserToDelete(null);
		} catch (error: any) {
			console.error("Error deleting user:", error.message || error);
			toast({
				title: "Error",
				description: error.message || "Failed to delete user. Please try again.",
				variant: "destructive",
				duration: 5000,
			});
		}
	}, [userToDelete, toast, setUsers]);

	const handleResetPassword = useCallback(async (email: string) => {
		if (isResetPasswordCooldown) {
			toast({
				title: "Please wait",
				description: "You can only send a reset password email every 30 seconds.",
				variant: "destructive",
				duration: 5000,
			});
			return;
		}

		try {
			await sendPasswordResetEmail(auth, email);
			toast({
				title: "Password Reset Email Sent",
				description: `A password reset email has been sent to ${email}.`,
				duration: 5000,
			});
			setIsResetPasswordDialogOpen(false);
			setIsResetPasswordCooldown(true);
			setTimeout(() => setIsResetPasswordCooldown(false), 30000);
		} catch (error) {
			console.error("Error sending password reset email:", error);
			toast({
				title: "Error",
				description: "Failed to send password reset email. Please try again.",
				variant: "destructive",
				duration: 5000,
			});
		}
	}, [isResetPasswordCooldown, toast]);

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
				<Card className="w-full max-w-[400px]">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-center">Error</CardTitle>
					</CardHeader>
					<CardContent>
						<Alert variant="destructive">
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (!user || !username) {
		return <div className="flex items-center justify-center h-screen text-2xl font-semibold">Loading...Admin Dashboard</div>;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-gray-50 border-b border-gray-300 shadow-sm">
				<div className="lg:max-w-[80%] mx-auto px-3 md:px-4  lg:px-8 py-3 md:py-4  flex justify-between items-center">
					<div className="flex items-center">
						<h1 className="text-2xl font-semibold">
							Admin Dashboard
						</h1>
					</div>
					<div className="text-md hidden md:block font-semibold text-left">Welcome, {username}</div>
					<Button onClick={handleLogout} variant="outline" className="flex items-center">
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</header>
			<main className="flex-grow container mx-auto p-4 md:p-6">
				<UserTable 
					users={users} 
					onRoleChange={handleRoleChange}
					onDeleteUser={(userId) => handleDeleteUser(userId, users.find(u => u.id === userId)?.email || '')}
					onEditUser={handleEditUser}
					onResetPassword={(email) => {
						setResetPasswordEmail(email);
						setIsResetPasswordDialogOpen(true);
					}}
					onCreateUser={handleCreateUser}
				/>
			</main>
			<Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Role Change</DialogTitle>
						<DialogDescription>
							Are you sure you want to change this user's role to {pendingRoleChange?.newRole}?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>Cancel</Button>
						<Button onClick={confirmRoleChange}>Confirm</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm Password Reset</DialogTitle>
						<DialogDescription>
							Are you sure you want to send a password reset email to {resetPasswordEmail}?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>Cancel</Button>
						<Button onClick={() => handleResetPassword(resetPasswordEmail)} disabled={isResetPasswordCooldown}>
							{isResetPasswordCooldown ? "Please wait..." : "Send Reset Email"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Confirm User Deletion</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete the user with email {userToDelete?.email}? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>Cancel</Button>
						<Button onClick={confirmDeleteUser} variant="destructive">
							Delete User
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminDashboard;
