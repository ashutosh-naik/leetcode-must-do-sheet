"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your email");
      setLoading(false);
      return;
    }

    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (err) {
        setLoading(false);
        setError(err.message);
        return;
      }

      setLoading(false);
      setSent(true);
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
            <h1 className="mb-2 text-center font-heading text-xl font-bold tracking-tight">
            Forgot Password
          </h1>
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Check your email for a password reset link.
              </p>
              <Link
                href="/login"
                className="block text-sm font-medium text-primary hover:underline transition-colors duration-150"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground text-center">
                Enter your email and we&apos;ll send you a reset link.
              </p>
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
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
                )}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-primary hover:bg-brand-hover text-white font-medium shadow-sm cursor-pointer border-none"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="font-medium text-primary hover:underline transition-colors duration-150"
                >
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
