"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserRound } from "lucide-react";
import UserTable from "@/components/admin/UserTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { User } from "firebase/auth";

const AdminDashboard = () => {
	const [user, setUser] = useState<User | null>(null);
	const [username, setUsername] = useState("");
	const [error, setError] = useState("");
	const router = useRouter();

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

		return () => unsubscribe();
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
		return <div className="flex items-center justify-center h-screen">Loading...</div>;
	}

	return (
		<div className="min-h-screen flex flex-col">
			<header className="bg-gray-50 border-b border-gray-100 shadow-sm">
				<div className="lg:max-w-[60%] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
					<div className="flex items-center">
						<UserRound className="mr-2 p-1 h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all duration-300" />
						<h1 className="text-2xl font-normal">
							Welcome, <span className="capitalize">{username}</span>
						</h1>
					</div>
					<Button onClick={handleLogout} variant="outline" className="flex items-center">
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</header>
			<main className="flex-grow container mx-auto p-4 md:p-6">
				<UserTable />
			</main>
		</div>
	);
};

export default AdminDashboard;
