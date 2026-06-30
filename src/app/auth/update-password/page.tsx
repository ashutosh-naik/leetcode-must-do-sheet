"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!password || !confirmPassword) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const { error: err } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (err) {
      setError(err.message);
      return;
    }

    setSuccess(true);
  }

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.push("/"), 1500);
    return () => clearTimeout(timer);
  }, [success, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <h1 className="mb-2 text-center text-xl font-bold tracking-tight">
            Update Password
          </h1>
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-green-500 font-medium">
                Password updated successfully!
              </p>
              <p className="text-sm text-muted-foreground">
                Redirecting to home...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  New Password
                </label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl border-border bg-background focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-10 rounded-xl border-border bg-background focus-visible:border-primary focus-visible:ring-primary placeholder:text-muted-foreground/60"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-primary hover:bg-brand-hover text-white font-medium shadow-sm cursor-pointer border-none"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
