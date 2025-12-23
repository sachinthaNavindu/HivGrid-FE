import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Image, Users, Heart } from 'lucide-react';

const Index: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // If authenticated, redirect to home
  if (!isLoading && isAuthenticated) {
    window.location.href = '/home';
    return null;
  }

  return (
    <div className="min-h-screen gradient-subtle overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute -bottom-40 right-1/3 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-semibold text-foreground">
            HivGrid
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="gradient" size="sm">
              Sign up
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Discover your creative potential
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Share Your
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              Creative Vision
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join a community of creators, share your ideas, and discover 
            inspiration from around the world. Your next masterpiece awaits.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link to="/register">
              <Button variant="gradient" size="xl" className="gap-2 min-w-[200px]">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl" className="min-w-[200px]">
                I have an account
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="bg-card p-6 rounded-2xl shadow-card hover-lift">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Image className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Beautiful Gallery
            </h3>
            <p className="text-muted-foreground text-sm">
              Showcase your work in a stunning masonry grid layout that brings your creations to life.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-card hover-lift">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Creative Community
            </h3>
            <p className="text-muted-foreground text-sm">
              Connect with like-minded creators, share inspiration, and grow together.
            </p>
          </div>

          <div className="bg-card p-6 rounded-2xl shadow-card hover-lift">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Easy Sharing
            </h3>
            <p className="text-muted-foreground text-sm">
              Upload and share your work in seconds with our intuitive publishing tools.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-muted-foreground text-sm">
        <p>© 202 HivGrid. Made with creativity and passion.</p>
      </footer>
    </div>
  );
};

export default Index;
