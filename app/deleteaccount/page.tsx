"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, firestore } from "@/firebase/firebase";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
} from "firebase/auth";
import { deleteDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";


const Page = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await user.reload(); // Refresh user data
        if (user.emailVerified) {
          setIsVerified(true);
        } else {
          setIsVerified(false);
          setError("Your email is not verified. Please verify your email to delete your account.");
        }
      } else {
        // Redirect unauthenticated users to the login page
        router.push("/login");
      }
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, [router]);

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (user && user.emailVerified) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        
        // Delete user data from Firestore
        await deleteDoc(doc(firestore, "users", user.uid));
        
        // Delete user's posts (if any)
        const postsQuery = query(collection(firestore, "posts"), where("userId", "==", user.uid));
        const postsSnapshot = await getDocs(postsQuery);
        const deletePostPromises = postsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePostPromises);
        
        // Delete user's comments (if any)
        const commentsQuery = query(collection(firestore, "comments"), where("userId", "==", user.uid));
        const commentsSnapshot = await getDocs(commentsQuery);
        const deleteCommentPromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deleteCommentPromises);
        
        // Add more delete operations for other collections as needed
        
        // Delete the user account
        await deleteUser(user);
        
        router.push("/login"); // Redirect to login page after deletion
      } else {
        setError("User is not verified or not logged in");
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete account");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isVerified === null) {
    // You can return a loading spinner here if desired
    return <div className="container mx-auto mt-10 p-4">Loading...</div>;
  }

  if (!isVerified) {
    return (
      <div className="container mx-auto mt-10 p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error || "Your account cannot be deleted because your email is not verified."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-10 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Deleting Account..." : "Delete Account"}
            </Button>
          </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
