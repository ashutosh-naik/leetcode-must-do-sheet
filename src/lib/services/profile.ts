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
