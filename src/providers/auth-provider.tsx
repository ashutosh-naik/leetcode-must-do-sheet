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
import { createProfile } from "@/lib/services/profile";

// Global error handler for unhandled rejections
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled rejection:", event.reason);
    event.preventDefault();
  });
}

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
  const profileCreated = useRef(false);

  const ensureProfile = useCallback(async (currentUser: User) => {
    if (profileCreated.current) return;
    profileCreated.current = true;
    try {
      await createProfile(
        currentUser.id,
        currentUser.user_metadata?.name ??
          currentUser.user_metadata?.username ??
          currentUser.email?.split("@")[0] ??
          "User",
        currentUser.email ?? "",
      );
    } catch (err) {
      // profile already exists or other error — ignore
      console.error("Profile creation error:", err);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) {
        ensureProfile(u).catch((err) => {
          console.error("Error ensuring profile:", err);
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setLoading(false);
      if (u) {
        ensureProfile(u).catch((err) => {
          console.error("Error ensuring profile:", err);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [ensureProfile]);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) return error.message;
      router.push("/");
      return null;
    },
    [router],
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
