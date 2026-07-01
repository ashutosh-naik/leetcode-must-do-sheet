"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/auth-provider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, googleLogin, githubLogin } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const err = await register(email, password, username);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess("Account created! Check your email for a confirmation link.");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
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
            Create Account
          </h1>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 rounded-xl border-border bg-background focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter email"
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Confirm Password
              </label>
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-xl border-border bg-background focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-brand-hover text-white font-medium shadow-sm transition-colors cursor-pointer border-none"
            >
              {loading ? "Creating account..." : "Register"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
          </p>
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
