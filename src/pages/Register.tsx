import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, User, Lock, ArrowRight } from "lucide-react";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "@/lib/validation";
import { InferType } from "yup";

type RegisterForm =InferType<typeof registerSchema>

const Register: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { register: authRegister, sendVerificationCode } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>({
    resolver: yupResolver(registerSchema),
  });

  const emailValue = watch("email");

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);

    try {
      await authRegister(data.email, data.password, data.username, data.code);

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });

      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description:
          error?.response?.data?.message ||
          "Registration failed. Please try again.",
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              disabled={isLoading}
              className="pl-11"
              {...register("email")}
            />
          </div>
          <p className="text-sm text-red-500">{errors.email?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="verify_code"
              type="text"
              placeholder="Verification code"
              disabled={isLoading}
              className="pl-11"
              {...register("code")}
            />
          </div>
          <p className="text-sm text-red-500">{errors.code?.message}</p>
        </div>

        <Button
          type="button"
          variant="secondary"
          disabled={isLoading || !emailValue}
          onClick={async () => {
            try {
              await sendVerificationCode(emailValue);
              toast({
                title: "Verification code sent",
                description: "Check your email inbox.",
              });
            } catch (error: any) {
              toast({
                title: "Failed to send code",
                description:
                  error?.response?.data?.message || "Something went wrong.",
                variant: "destructive",
              });
            }
          }}
        >
          Send Code
        </Button>

        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="your_username"
              disabled={isLoading}
              className="pl-11"
              {...register("username")}
            />
          </div>
          <p className="text-sm text-red-500">{errors.username?.message}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              className="pl-11"
              {...register("password")}
            />
          </div>
          <p className="text-sm text-red-500">{errors.password?.message}</p>
        </div>

        <Button type="submit" variant="gradient" className="w-full gap-2" disabled={isLoading}>
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
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
