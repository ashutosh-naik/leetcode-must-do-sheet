"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { getProfile } from "@/lib/services/profile";
import { Loader2 } from "lucide-react";

export default function ProfileRedirectPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const profile = await getProfile(user.id);
        if (cancelled) return;
        if (profile?.username) {
          router.replace(`/profile/${profile.username}`);
        } else {
          router.replace("/");
        }
      } catch {
        if (!cancelled) router.replace("/");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
