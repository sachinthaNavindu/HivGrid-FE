import React, { useState, useEffect } from "react";
import {
  postsAPI,
  Post,
  User,
  hireApi,
  HiringAd,
  profileAPI,
  userApi,
} from "@/services/api";
import Navbar from "@/components/layout/Navbar";
import { useToast } from "@/hooks/use-toast";
import {
  Trash2,
  AlertTriangle,
  Users,
  FileText,
  Briefcase,
  Shield,
  Mail,
  User as UserIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

type AdminUser = User & {
  _id: string;
  name: string;
  role?: string;
  profilePicture?: string;
};

type AdminPost = Post & {
  author?: {
    name: string;
    profilePicture?: string;
  };
  createdAt?: string;
};

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "hireAds" | "users">(
    "posts"
  );
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [hireAds, setHireAds] = useState<HiringAd[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState({
    posts: false,
    hireAds: false,
    users: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab]);

  const loadData = async (tab: "posts" | "hireAds" | "users") => {
    setIsLoading((prev) => ({ ...prev, [tab]: true }));
    const usersData = await profileAPI.getAllusers();
    setUsers(usersData.users);

    try {
      switch (tab) {
        case "posts":
          const postsData = await postsAPI.loadData();

          const transformedPosts = postsData.map((post) => ({
            ...post,
            author:
              typeof post.user === "object" && post.user !== null
                ? {
                    name: post.user.username || "Unknown User",
                    profilePicture: post.user.imageUrl,
                  }
                : { name: "Unknown User" },
          }));
          setPosts(transformedPosts);
          break;
        case "hireAds":
          const hireAdsData = await hireApi.getAllHiringAds();
          setHireAds(hireAdsData);
          break;
        case "users":
          const usersData = await profileAPI.getAllusers();
          setUsers(usersData.users);
          break;
      }
    } catch (error: any) {
      toast({
        title: `Failed to load ${tab}`,
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [tab]: false }));
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await postsAPI.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      toast({
        title: "Post deleted",
        description: "Post has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete post",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDeleteHireAd = async (adId: string) => {
    try {
      await hireApi.deleteHireAd(adId);
      setHireAds((prev) => prev.filter((ad) => ad._id !== adId));
      toast({
        title: "Hire Ad deleted",
        description: "Ad has been removed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete ad",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleWarnUser = async (userId: string) => {
    try {
      await userApi.warn(userId);
      toast({
        title: "User warned",
        description: "A warning has been sent to the user",
      });
    } catch (error: any) {
      toast({
        title: "Failed to warn user",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await userApi.deleteUser(userId);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
      toast({
        title: "User deleted",
        description: "User has been removed from the system",
      });
    } catch (error: any) {
      toast({
        title: "Failed to delete user",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const filteredPosts = posts.filter((post) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.caption?.toLowerCase().includes(query) ||
      post.author?.name?.toLowerCase().includes(query)
    );
  });

  const filteredHireAds = hireAds.filter((ad) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ad.description.toLowerCase().includes(query) ||
      ad.username?.toLowerCase().includes(query) ||
      ad.email?.toLowerCase().includes(query)
    );
  });

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (user.username || "").toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.name || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="lg:col-span-1">
              <CardHeader className="text-center">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg">
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-3xl bg-primary/10">
                      {user?.username?.charAt(0)?.toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {user?.username}
                    </CardTitle>
                    <CardDescription className="flex items-center justify-center gap-2 mt-2">
                      <Shield className="w-5 h-5" />
                      <span className="text-lg">
                        {user?.roles?.join(", ") || "Admin"}
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground text-base">
                      {user?.email}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl text-center border">
                      <div className="text-3xl font-bold text-primary">
                        {posts.length}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Posts
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-xl text-center border">
                      <div className="text-3xl font-bold text-primary">
                        {users.length}
                      </div>
                      <div className="text-sm text-muted-foreground font-medium">
                        Users
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  className="w-full mt-2"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-3 space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-base"
                />
              </div>

              <Tabs
                defaultValue="posts"
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="hireAds"
                    className="flex items-center gap-2"
                  >
                    <Briefcase className="w-4 h-4" />
                    Hire Ads
                  </TabsTrigger>
                  <TabsTrigger
                    value="users"
                    className="flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="space-y-4">
                  {isLoading.posts ? (
                    <div className="text-center py-12">Loading posts...</div>
                  ) : filteredPosts.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPosts.map((post) => (
                        <Card
                          key={post._id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-3 flex-1">
                                <h3 className="font-semibold text-lg">
                                  {post.title}
                                </h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {post.caption}
                                </p>
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-12 h-12 border-2 border-border">
                                    <AvatarImage
                                      src={post.author?.profilePicture}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-secondary/10">
                                      {post.author?.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <span className="font-medium text-sm">
                                      {post.author?.name}
                                    </span>
                                    {post.createdAt && (
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(
                                          post.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {post.tags && post.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 pt-2">
                                    {post.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-xs px-3 py-1"
                                      >
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeletePost(post._id)}
                                className="ml-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">
                          No posts found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? "Try a different search term"
                            : "No posts have been created yet"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="hireAds" className="space-y-4">
                  {isLoading.hireAds ? (
                    <div className="text-center py-12">Loading hire ads...</div>
                  ) : filteredHireAds.length > 0 ? (
                    <div className="space-y-4">
                      {filteredHireAds.map((ad) => (
                        <Card
                          key={ad._id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                              <div className="space-y-3 flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">
                                    {ad.description.slice(0, 50)}...
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50"
                                  >
                                    Hiring
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {ad.description}
                                </p>
                                <div className="flex items-center gap-4 text-sm">
                                  {ad.username && (
                                    <div className="flex items-center gap-2">
                                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium">
                                        @{ad.username}
                                      </span>
                                    </div>
                                  )}
                                  {ad.email && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-muted-foreground">
                                        {ad.email}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {ad.selectedSkills &&
                                  ad.selectedSkills.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                      {ad.selectedSkills.map((skill) => (
                                        <Badge
                                          key={skill}
                                          variant="secondary"
                                          className="text-xs px-3 py-1"
                                        >
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteHireAd(ad._id)}
                                className="ml-4"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">
                          No hire ads found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? "Try a different search term"
                            : "No hire ads have been created yet"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  {isLoading.users ? (
                    <div className="text-center py-12">Loading users...</div>
                  ) : filteredUsers.length > 0 ? (
                    <div className="space-y-4">
                      {filteredUsers.map((user) => (
                        <Card
                          key={user._id}
                          className="hover:shadow-lg transition-shadow"
                        >
                          <CardContent className="p-6">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16 border-2 border-border shadow-sm">
                                  <AvatarImage
                                    src={user.imageUrl}
                                    className="object-cover"
                                  />
                                  <AvatarFallback className="bg-primary/10 text-lg">
                                    <UserIcon className="w-8 h-8" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-lg">
                                      {user.username || user.email}
                                    </h3>
                                    {user.roles && (
                                      <Badge
                                        variant={
                                          user.roles.includes("admin")
                                            ? "default"
                                            : "secondary"
                                        }
                                      >
                                        {user.roles.includes("admin")
                                          ? "Admin"
                                          : "User"}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {user.email}
                                  </p>
                                  {user.username && (
                                    <p className="text-xs text-muted-foreground">
                                      @{user.username}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleWarnUser(user._id)}
                                >
                                  <AlertTriangle className="w-4 h-4 mr-2" />
                                  Warn
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user._id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-semibold text-lg mb-2">
                          No users found
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? "Try a different search term"
                            : "No users registered yet"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
