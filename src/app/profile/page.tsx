"use client";

import { User, Mail } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <h1 className="font-heading text-2xl font-bold tracking-tight">Profile</h1>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center">
            <User className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-lg font-semibold">{user?.user_metadata?.name ?? "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email ?? "No email"}</p>
          </div>
        </div>
        <hr className="border-border" />
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Email:</span>
          <span>{user?.email}</span>
        </div>
      </div>
    </div>
  );
}
