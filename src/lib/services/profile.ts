import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  display_name: string | null;
  username: string | null;
  gender: string | null;
  location: string | null;
  birthday: string | null;
  github_url: string | null;
  linkedin_url: string | null;
}

export async function createProfile(
  userId: string,
  name: string,
  email: string,
  username?: string,
) {
  // Only set name/email if profile doesn't already exist (avoid overwriting OAuth user's custom name)
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      name,
      email,
      ...(username ? { username } : {}),
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

function isProfile(data: unknown): data is Profile {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.name === "string" && typeof obj.email === "string";
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    logger.error("getProfile error:", error.message);
    return null;
  }
  if (!isProfile(data)) {
    logger.error("getProfile: invalid profile shape", data);
    return null;
  }
  return data;
}

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, avatar_url, display_name, username, gender, location, birthday, github_url, linkedin_url, created_at")
    .eq("username", username)
    .single();

  if (error) {
    logger.error("getProfileByUsername error:", error.message);
    return null;
  }
  if (!isProfile(data)) {
    logger.error("getProfileByUsername: invalid profile shape", data);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Omit<Profile, "id" | "email">>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  if (!isProfile(data)) throw new Error("Invalid profile shape returned from update");
  return data;
}
