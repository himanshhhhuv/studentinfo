"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth, firestore } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LogOut,
  Key,
  Trash2,
  Home,
  GraduationCap,
  UserRound,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const validPaths = ["/", "/dashboard", "/profile", "/settings","/deleteaccount","/changepassword"]; // Add all your valid app routes here
  const showHeader = validPaths.includes(pathname);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(firestore, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(`${userData?.firstName} ${userData?.lastName}`);
        }
      } else {
        setUser(null);
        setUsername(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleChangePassword = () => {
    router.push("/changepassword");
  };

  const handleAccountDelete = () => {
    router.push("/deleteaccount");
  };

  const handleDashboardRoute = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && (
        <header className="bg-gray-50 border-b border-gray-100 shadow-sm ">
          <div className="lg:max-w-[60%] mx-auto px-8 sm:px-6 lg:px-4 py-4 flex justify-between items-center">
            <div className="flex items-center ">
              <UserRound className="mr-2 p-1 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all duration-300" />
              <h1 className="text-sm md:text-lg font-normal">
                Welcome, <span className="capitalize text-md md:text-lg">{username || 'Student'}</span>
              </h1>
            </div>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full "
                  >
                    <Avatar className="h-12 w-12 border-2 border-gray-300 hover:border-gray-500 transition-all duration-300">
                      <AvatarImage
                        src={user?.photoURL || undefined}
                        alt={username || ""}
                      />
                      <AvatarFallback className="text-black text-xl font-normal bg-gray-100">{username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80 h-[60]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-5">
                      <p className="text-lg font-semibold capitalize leading-none">
                        {username}
                      </p>
                      <p className="text-sm font-normal leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDashboardRoute}>
                    <Home className="mr-2 h-8 w-6" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleChangePassword}>
                    <Key className="mr-2 h-8 w-6" />
                    <span>Change Password</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAccountDelete}>
                    <Trash2 className="mr-2 h-8 w-6" />
                    <span>Delete Account</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-8 w-6" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>
      )}
      <main className="flex-grow">{children}</main>
    </div>
  );
};

export default Layout;
