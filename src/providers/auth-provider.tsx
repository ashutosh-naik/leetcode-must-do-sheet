"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createProfile, getProfile, updateProfile } from "@/lib/services/profile";
import { generateUniqueUsername } from "@/lib/username";
import { logger } from "@/lib/logger";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (
    email: string,
    password: string,
    username: string,
  ) => Promise<string | null>;
  googleLogin: () => Promise<void>;
  githubLogin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  googleLogin: async () => {},
  githubLogin: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const profileCreated = useRef<string | null>(null);

  const ensureProfile = useCallback(async (currentUser: User) => {
    if (profileCreated.current === currentUser.id) return;
    try {
      const name =
        currentUser.user_metadata?.name ??
        currentUser.user_metadata?.username ??
        currentUser.email?.split("@")[0] ??
        "User";
      const email = currentUser.email ?? "";

      const existing = await getProfile(currentUser.id);

      if (existing) {
        if (!existing.username) {
          const emailPrefix = currentUser.email?.split("@")[0] ?? "user";
          const username = await generateUniqueUsername(emailPrefix);
          await updateProfile(currentUser.id, { username });
        }
      } else {
        const emailPrefix = currentUser.email?.split("@")[0] ?? "user";
        const username = await generateUniqueUsername(emailPrefix);
        await createProfile(currentUser.id, name, email, username);
      }

      profileCreated.current = currentUser.id;
    } catch (err) {
      profileCreated.current = null;
      logger.error("Profile creation error:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (cancelled) return;
      setUser(u);
      setLoading(false);
      if (u) {
        ensureProfile(u).catch((err) => {
          logger.error("Error ensuring profile:", err);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) {
        ensureProfile(u).catch((err) => {
          logger.error("Error ensuring profile:", err);
        });
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;
      return null;
    },
    [],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      username: string,
    ): Promise<string | null> => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/`,
        },
      });
      if (error) return error.message;
      return null;
    },
    [],
  );

  const googleLogin = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const githubLogin = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
      },
    });
    if (error) throw new Error(error.message);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        githubLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
