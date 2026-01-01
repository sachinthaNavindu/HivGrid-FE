import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, Plus, User, LogOut, Sparkles,ThumbsUp } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            to="/" 
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl gradient-warm flex items-center justify-center shadow-md group-hover:shadow-glow transition-all">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold text-foreground hidden sm:block">
              HivGrid
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/">
                  <Button 
                    variant={isActive('/') ? 'default' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>

                <Link to="/create">
                  <Button 
                    variant={isActive('/create') ? 'default' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create</span>
                  </Button>
                </Link>
                
                <Link to="/hirePage"> 
                  <Button 
                      variant={isActive('/hirePage')?'default':'ghost'}
                      size='sm'
                      className="gap-2"
                  >
                    <ThumbsUp className='w-4 h-4' />
                    <span className='hidden sm:inline'>Hire</span>
                  </Button>
                </Link>

                <Link to="/profile">
                  <Button 
                    variant={isActive('/profile') ? 'default' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    {user?.imageUrl ? (
                      <img 
                        src={user.imageUrl} 
                        alt={user.username} 
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{user?.username || 'Profile'}</span>
                  </Button>
                </Link>


                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
