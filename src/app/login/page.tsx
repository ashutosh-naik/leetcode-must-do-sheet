"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      alert("Please fill all fields");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      alert(error.message);
    }
  }

  async function signInWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h1 className="mb-2 text-center text-xl font-bold tracking-tight">
            Sign In
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Username or Email
              </label>
              <input
                type="text"
                placeholder="Enter username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-colors placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary transition-colors placeholder:text-muted-foreground/60"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-brand-hover text-white font-medium shadow-sm transition-colors cursor-pointer border-none"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-4 flex items-center justify-between text-sm">
            <Link
              href="/forgot-password"
              className="text-muted-foreground hover:text-foreground"
            >
              Forgot Password?
            </Link>
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or you can sign in with
            </span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            className="flex-1 gap-2 font-medium cursor-pointer"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={signInWithGitHub}
            className="flex-1 gap-2 font-medium cursor-pointer"
          >
            <Image src="/github.svg" alt="GitHub" width={20} height={20} />
            GitHub
          </Button>
        </div>
      </div>
    </main>
  );
}
