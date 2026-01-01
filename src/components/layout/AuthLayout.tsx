import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen gradient-subtle flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
            <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display text-3xl font-semibold text-foreground">
              HivGrid
            </span>
          </Link>

          <div className="bg-card rounded-3xl shadow-elevated p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-muted-foreground text-sm">
                  {subtitle}
                </p>
              )}
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
