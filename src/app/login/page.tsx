"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const { login, googleLogin, githubLogin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState(() => {
    try {
      return searchParams.get("error") ? decodeURIComponent(searchParams.get("error")!) : "";
    } catch {
      return "";
    }
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    const err = await login(email, password);
    if (err) {
      setLoading(false);
      setError(err);
      return;
    }
    const next = searchParams.get("next");
    if (next && next.startsWith("/") && !next.includes("://")) {
      router.push(next);
    } else {
      router.push("/");
    }
  }

  const handleGoogleLogin = async () => {
    setSocialLoading("google");
    try {
      await googleLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

  const handleGitHubLogin = async () => {
    setSocialLoading("github");
    try {
      await githubLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSocialLoading(null);
    }
  };

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

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl border-border bg-background focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl border-border bg-background focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
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
            onClick={handleGoogleLogin}
            disabled={socialLoading !== null}
            className="flex-1 gap-2 font-medium cursor-pointer disabled:opacity-50"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} />
            {socialLoading === "google" ? "Loading..." : "Google"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleGitHubLogin}
            disabled={socialLoading !== null}
            className="flex-1 gap-2 font-medium cursor-pointer disabled:opacity-50"
          >
            <Image src="/github.svg" alt="GitHub" width={20} height={20} />
            {socialLoading === "github" ? "Loading..." : "GitHub"}
          </Button>
        </div>
      </div>
    </main>
  );
}
