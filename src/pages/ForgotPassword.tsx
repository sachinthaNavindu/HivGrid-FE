import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '@/services/api';
import AuthLayout from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, ArrowLeft, Lock, CheckCircle } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSendCode = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSendingCode(true);
    try {
      await authAPI.forgotPassword(email);
      setIsCodeSent(true);
      toast({
        title: "Code sent",
        description: "We've sent a reset code to your email.",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to send code. Please try again.";
      toast({
        title: "Request failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authAPI.forgotPassword(email);
      setIsSuccess(true);
      toast({
        title: "Password changed",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to change password. Please try again.";
      toast({
        title: "Request failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Password Changed" 
        subtitle="Your password has been updated successfully"
      >
        <div className="text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-accent" />
          </div>
          
          <div className="space-y-2">
            <p className="text-muted-foreground">
              You can now log in with your new password.
            </p>
          </div>

          <Link to="/login">
            <Button variant="gradient" className="w-full gap-2">
              Go to Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset your password" 
      subtitle="Enter your email and new password"
    >
      <form onSubmit={handleChangePassword} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11"
                disabled={isSendingCode || isChangingPassword}
              />
            </div>
            <Button
              type="button"
              variant={isCodeSent ? "outline" : "secondary"}
              onClick={handleSendCode}
              disabled={isSendingCode || !email}
              className="shrink-0"
            >
              {isSendingCode ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isCodeSent ? (
                "Resend"
              ) : (
                "Send Code"
              )}
            </Button>
          </div>
          {isCodeSent && (
            <p className="text-xs text-accent">
              Reset code sent! Check your email.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
            New Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="newPassword"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pl-11"
              disabled={isChangingPassword}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          variant="gradient"
          className="w-full"
          disabled={isChangingPassword || !isCodeSent}
        >
          {isChangingPassword ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Changing...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link 
          to="/login" 
          className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
