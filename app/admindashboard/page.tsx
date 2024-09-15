"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { UserRound } from "lucide-react";
import StudentInfo from "@/components/admin/UserTable";

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userRole = localStorage.getItem("userRole");
        if (userRole === "admin") {
          router.push("/dashboard");
        } else {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(`${userData?.firstName} ${userData?.lastName}`);
          }
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-50 border-b border-gray-100 shadow-sm">
        <div className="lg:max-w-[60%] mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <UserRound className="mr-2 p-1 h-12 w-12 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all duration-300" />
            <h1 className="text-2xl font-normal">
              Welcome, <span className="capitalize">{username || 'Admin'}</span>
            </h1>
          </div>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <StudentInfo />
      </main>
    </div>
  );
};

export default AdminDashboard;
