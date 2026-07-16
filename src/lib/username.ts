import { supabase } from "@/lib/supabase";

function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
}

export async function generateUniqueUsername(
  base: string,
): Promise<string> {
  const slug = cleanSlug(base) || "user";

  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug}${Math.floor(1000 + Math.random() * 9000)}`;

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", candidate)
      .maybeSingle();

    if (!data) return candidate;
  }

  return `${slug}-${Date.now().toString(36)}`;
}
