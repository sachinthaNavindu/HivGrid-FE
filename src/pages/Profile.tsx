import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { profileAPI, Post, postsAPI } from "@/services/api";
import Navbar from "@/components/layout/Navbar";
import PostCard from "@/components/posts/PostCard";
import PostModal from "@/components/posts/PostModal";
import EditPostModal from "@/components/posts/EditPostModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  Edit2,
  Trash2,
  Loader2,
  User,
  Mail,
  Save,
  X,
  AlertTriangle,
} from "lucide-react";

const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [postCount, setPostCount] = useState(0);

  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user) setEditUsername(user.username);
  }, [user]);

  const loadUserData = async () => {
    try {
      const profile = await profileAPI.getUserProfile();
      setPostCount(profile.postCount);
      setUserPosts(profile.posts);
    } catch (error) {
      toast({
        title: "Failed to load profile",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("username", editUsername.trim());
      if (newImage) formData.append("image", newImage);

      const updatedUser = await profileAPI.updateProfile(formData);
      updateUser(updatedUser.user);

      setIsEditing(false);
      setNewImage(null);
      setImagePreview(null);

      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await profileAPI.deleteAccount();
      logout();
      navigate("/login");
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Deletion failed",
        description:
          error.response?.data?.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditUsername(user?.username || "");
    setNewImage(null);
    setImagePreview(null);
  };

  const currentImage = imagePreview || user?.imageUrl;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl shadow-card p-8 mb-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                {currentImage ? (
                  <img
                    src={currentImage}
                    alt={user?.username}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-border"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-secondary flex items-center justify-center ring-4 ring-border">
                    <User className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}

                {isEditing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 rounded-full bg-foreground/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-background" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-medium">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="max-w-xs"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                      {user?.username}
                    </h1>
                    <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mb-4">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                    <div className="flex gap-2 justify-center sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <div className="text-center px-6 py-3 bg-secondary/50 rounded-2xl">
                <p className="font-display text-2xl font-bold text-foreground">
                  {postCount}
                </p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
            </div>
          </div>

          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            <h2 className="font-display text-xl font-semibold text-foreground mb-6">
              Your Posts
            </h2>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : userPosts.length > 0 ? (
              <div className="masonry-grid">
                {userPosts.map((post, index) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    index={index}
                    onClick={() => setSelectedPost(post)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  No posts yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Start sharing your creativity with the world!
                </p>
                <Button variant="gradient" onClick={() => navigate("/create")}>
                  Create your first post
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={() => setEditingPost(selectedPost)}
          onDelete={() => {
            setUserPosts((prev) =>
              prev.filter((p) => p._id !== selectedPost._id)
            );
            setSelectedPost(null);
            toast({
              title: "Post deleted",
              description: "Your post has been removed",
            });
          }}
          showActions={true}
        />
      )}

      {editingPost && (
        <EditPostModal
          open={!!editingPost}
          post={editingPost}
          onClose={() => setEditingPost(null)}
          onSave={async ({ title, caption, tags }) => {
            try {
              const updated = await postsAPI.updatePost(
                editingPost!._id,
                title,
                caption,
                tags
              );

              setUserPosts((prev) =>
                prev.map((p) => (p._id === updated.post._id ? updated.post : p))
              );

              setEditingPost(null);

              toast({
                title: "Post updated",
                description: "Your post has been successfully updated",
              });
            } catch (error: any) {
              toast({
                title: "Update failed",
                description:
                  error.response?.data?.message || "Failed to update post",
                variant: "destructive",
              });
            }
          }}
        />
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to delete your account? All of your posts
              and data will be permanently removed.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
