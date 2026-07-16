import { supabase } from "@/lib/supabase";

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
) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      name,
      email,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
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
  return data as Profile;
}
