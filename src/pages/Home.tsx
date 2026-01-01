import React, { useState, useEffect } from 'react';
import { postsAPI, Post } from '@/services/api';
import Navbar from '@/components/layout/Navbar';
import PostCard from '@/components/posts/PostCard';
import PostModal from '@/components/posts/PostModal';
import PostSkeleton from '@/components/posts/PostSkeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const posts = await postsAPI.loadData();
      console.log(posts)
      setPosts(posts)
    } catch (error: any) {
      toast({
        title: "Failed to load posts",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.caption?.toLowerCase().includes(query) ||
      post.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  const handleDeletePost = async (postId: string) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
    setSelectedPost(null);
    toast({
      title: "Post deleted",
      description: "Your post has been removed",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-8 px-4 gradient-subtle">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Discover amazing content
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Explore & Get Inspired
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover beautiful ideas, share your creativity, and connect with a community of creators.
            </p>
          </div>

          <div className="max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for inspiration..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base rounded-2xl shadow-card border-0 bg-card"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <PostSkeleton />
        ) : filteredPosts.length > 0 ? (
          <div className="masonry-grid">
            {filteredPosts.map((post, index) => (
              <PostCard
                key={post._id}
                post={post}
                index={index}
                onClick={() => setSelectedPost(post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No results found' : 'No posts yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Be the first to share something amazing!'}
            </p>
          </div>
        )}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onEdit={() => {}}
          onDelete={() => handleDeletePost(selectedPost._id)}
          showActions={false} 
        />
      )}
    </div>
  );
};

export default Home;
