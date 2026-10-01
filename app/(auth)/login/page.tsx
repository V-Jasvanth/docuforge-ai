"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export default function LoginPage() {
  const [email, setEmail] = useState("demo@docuforge.ai");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6">
      <Link href="/" className="flex items-center space-x-3 mb-8">
        <div className="h-10 w-10 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <span className="font-bold text-xl text-white tracking-tight">DocuForge AI</span>
      </Link>

      <Card className="w-full max-w-md bg-slate-900 border-slate-800 text-slate-100">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-slate-400 text-xs">
            Sign in to access your codebase documentation workspace
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="developer@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Foundation Credentials Demo:</p>
              <p>Email: <code className="text-brand-400">demo@docuforge.ai</code></p>
              <p>Password: <code className="text-brand-400">password123</code></p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4 pt-2">
            <Button type="submit" isLoading={isLoading} className="w-full">
              Sign In to Dashboard
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-400 hover:underline font-semibold">
                Register here
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
