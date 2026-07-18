import { supabase } from "@/lib/supabase";

function cleanSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);
}

const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function validateUsername(username: string): string | null {
  const trimmed = username.trim().toLowerCase();
  if (trimmed.length < 3) return "Username must be at least 3 characters";
  if (trimmed.length > 20) return "Username must be at most 20 characters";
  if (!USERNAME_REGEX.test(trimmed)) return "Username can only contain lowercase letters, numbers, and underscores";
  return null;
}

const URL_REGEX = /^https:\/\/[a-zA-Z0-9._~:/?#\[\]@!$&'()*+,;=%-]+$/;

export function validateProfileField(key: string, value: string): string | null {
  if (!value) return null; // empty = clear field, always valid
  switch (key) {
    case "display_name":
      if (value.length > 100) return "Display name must be at most 100 characters";
      break;
    case "location":
      if (value.length > 200) return "Location must be at most 200 characters";
      break;
    case "github_url":
    case "linkedin_url":
      if (!URL_REGEX.test(value)) return "URL must start with https://";
      break;
    case "birthday": {
      const date = new Date(value + "T00:00:00Z");
      if (Number.isNaN(date.getTime())) return "Invalid date";
      if (date > new Date()) return "Birthday cannot be in the future";
      break;
    }
  }
  return null;
}

export async function isUsernameTaken(
  username: string,
  excludeUserId?: string,
): Promise<boolean> {
  let query = supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .limit(1);

  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data } = await query.maybeSingle();
  return !!data;
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
