<Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback>{username?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>Welcome, {username}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Manage your account settings and preferences here.</p>
                </CardContent>
                <CardFooter className="flex flex-col space-y-2">
                    <div className="flex justify-between w-full">
                        <Button variant="outline" onClick={handlechangepassword}>
                            <Key className="mr-2 h-4 w-4" />
                            Change Password
                        </Button>
                        <Button variant="destructive" onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Button>
                    </div>
                    <Button variant="destructive" onClick={handleAccountDelete} className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                    </Button>
                </CardFooter>
            </Card>