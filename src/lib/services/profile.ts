import { supabase } from "@/lib/supabase";

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

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: { name?: string }) {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) throw error;
}
