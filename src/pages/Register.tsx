import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, User, Lock, ArrowRight } from "lucide-react";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register, sendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, username,code);
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      navigate("/login");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast({
        title: "Registration failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Pinspire and start sharing your creativity"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm font-medium text-foreground">
            Verification Code
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="verify_code"
              type="text"
              placeholder="Verification_code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="pl-11"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={isLoading || !email}
          className="whitespace-nowrap"
          onClick={async () => {
            if (!email) {
              toast({
                title: "Email required",
                description: "Please enter your email first.",
                variant: "destructive",
              });
              return;
            }

            try {
              await sendVerificationCode(email)

              toast({
                title: "Verification code sent",
                description: "Check your email inbox.",
              });
            } catch (error: any) {
              toast({
                title: "Failed to send code",
                description:
                  error.response?.data?.message || "Something went wrong.",
                variant: "destructive",
              });
            }
          }}
        >
          Send Code
        </Button>

        <div className="space-y-2">
          <Label
            htmlFor="username"
            className="text-sm font-medium text-foreground"
          >
            Username
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="your_username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-11"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-11"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Must be at least 6 characters
          </p>
        </div>

        <Button
          type="submit"
          variant="gradient"
          className="w-full gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
