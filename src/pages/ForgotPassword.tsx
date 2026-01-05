import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "@/services/api";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Mail,
  ArrowLeft,
  Lock,
  CheckCircle,
  Shield,
} from "lucide-react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
      await authAPI.sendVerificationCode(email);

      setIsCodeSent(true);
      toast({
        title: "Code sent",
        description: "A verification code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Request failed",
        description:
          error.response?.data?.message ||
          "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !verificationCode || !newPassword) {
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
      await authAPI.resetPassword({
        email,
        code: verificationCode,
        newPassword,
      });

      setIsSuccess(true);
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description:
          error.response?.data?.message ||
          "Failed to reset password. Please try again.",
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

          <p className="text-muted-foreground">
            You can now log in with your new password.
          </p>

          <Link to="/login">
            <Button variant="gradient" className="w-full">
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
      subtitle="Enter your email, verification code and new password"
    >
      <form onSubmit={handleChangePassword} className="space-y-5">
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
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
        </div>

        {isCodeSent && (
          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="pl-11"
                disabled={isChangingPassword}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>New Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
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
          disabled={
            isChangingPassword ||
            !isCodeSent ||
            !verificationCode ||
            !newPassword
          }
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
