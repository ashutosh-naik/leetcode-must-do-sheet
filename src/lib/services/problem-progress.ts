import { supabase } from "@/lib/supabase";
import { PROBLEMS } from "@/constants/problems";
import { logger } from "@/lib/logger";

export function extractSlug(link: string): string {
  try {
    const pathname = new URL(link).pathname.replace(/\/$/, "");
    const parts = pathname.split("/");
    return parts[parts.length - 1] ?? "";
  } catch {
    const parts = link.replace(/\/$/, "").split("/");
    return parts[parts.length - 1] ?? "";
  }
}

const slugCache = new Map<number, string>();
function getProblemSlug(id: number): string {
  if (!slugCache.has(id)) {
    const p = PROBLEMS.find((x) => x.id === id);
    slugCache.set(id, p ? extractSlug(p.link) : String(id));
  }
  return slugCache.get(id) ?? String(id);
}

function safeStringify(obj: unknown): string {
  try { return JSON.stringify(obj); } catch { return String(obj); }
}

function logSupabaseError(label: string, error: unknown) {
  const e = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  logger.error(`[${label}]`, safeStringify(error));
  logger.error({ message: e?.message, code: e?.code, details: e?.details, hint: e?.hint });
}

export async function upsertProblemProgress(
  userId: string,
  slug: string,
  solved: boolean,
) {
  if (solved) {
    const { error } = await supabase.from("problem_progress").upsert(
      {
        user_id: userId,
        problem_slug: slug,
        status: "Solved",
        last_solved_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,problem_slug",
        ignoreDuplicates: false,
      },
    );
    if (error) {
      logSupabaseError("upsertProblemProgress", error);
      throw error;
    }
  } else {
    const { error } = await supabase
      .from("problem_progress")
      .delete()
      .eq("user_id", userId)
      .eq("problem_slug", slug);
    if (error) {
      // PGRST116 = "Row not found" (PostgREST). Also check message for forward-compat.
      const isNotFound = error.code === "PGRST116" || error.message?.includes("0 rows");
      if (isNotFound) {
        logger.info("[deleteProblemProgress] Row not found (may be RLS deny):", slug);
      } else {
        logSupabaseError("deleteProblemProgress", error);
        throw error;
      }
    }
  }
}

export async function getSolvedProblemSlugs(userId: string): Promise<{ slug: string; lastSolvedAt: string | null }[]> {
  const { data, error } = await supabase
    .from("problem_progress")
    .select("problem_slug, last_solved_at")
    .eq("user_id", userId)
    .eq("status", "Solved");

  if (error) {
    logSupabaseError("getSolvedProblemSlugs", error);
    throw error;
  }
  return (data ?? []).map((r) => ({
    slug: r.problem_slug,
    lastSolvedAt: r.last_solved_at ?? null,
  }));
}

// Build slug→id map once at module level for O(n) lookups
const slugToId = new Map<string, number>();
for (const p of PROBLEMS) {
  slugToId.set(extractSlug(p.link), p.id);
}

export async function syncSolvedProblems(
  userId: string,
  localIds: number[],
  localDates?: Record<number, string>,
): Promise<{ ids: number[]; dates: Record<number, string> }> {
  let remoteRows: { slug: string; lastSolvedAt: string | null }[] | null;
  try {
    remoteRows = await getSolvedProblemSlugs(userId);
  } catch (err) {
    logSupabaseError("syncSolvedProblems-fetch", err);
    // null = fetch failed — skip upload to avoid overwriting server data
    return { ids: localIds, dates: localDates ?? {} };
  }

  // Use module-level slugToId map (built once at import time)
  const remoteIds = remoteRows
    .map((r) => slugToId.get(r.slug))
    .filter((id): id is number => id != null);

  const allIds = [...new Set([...remoteIds, ...localIds])];

  const dates: Record<number, string> = {};
  for (const row of remoteRows) {
    const id = slugToId.get(row.slug);
    if (id != null && row.lastSolvedAt) {
      dates[id] = row.lastSolvedAt;
    }
  }

  // Merge remote dates with local dates (remote wins if both exist)
  if (localDates) {
    for (const [idStr, date] of Object.entries(localDates)) {
      const id = Number(idStr);
      if (!(id in dates)) {
        dates[id] = date;
      }
    }
  }

  const remoteSlugSet = new Set(remoteRows.map((r) => r.slug));
  const toUpload = localIds.filter((id) => {
    const slug = getProblemSlug(id);
    return !remoteSlugSet.has(slug);
  });

  if (toUpload.length > 0) {
    const rows = toUpload.map((id) => {
      const localDate = localDates?.[id];
      let lastSolvedAt: string;
      if (localDate) {
        // Accept both ISO strings and legacy DD/MM/YYYY format
        if (localDate.includes("T")) {
          lastSolvedAt = localDate;
        } else {
          const parts = localDate.split("/");
          if (parts.length === 3) {
            const [day, month, year] = parts;
            lastSolvedAt = new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString();
          } else {
            lastSolvedAt = new Date().toISOString();
          }
        }
      } else {
        lastSolvedAt = new Date().toISOString();
      }
      return {
        user_id: userId,
        problem_slug: getProblemSlug(id),
        status: "Solved" as const,
        last_solved_at: lastSolvedAt,
      };
    });

    // ignoreDuplicates: true — if another tab synced first, remote wins.
    // Local unsynced changes are silently dropped (by design: remote is source of truth).
    const { error } = await supabase.from("problem_progress").upsert(rows, {
      onConflict: "user_id,problem_slug",
      ignoreDuplicates: true,
    });
    if (error) {
      logSupabaseError("syncSolvedProblems-upload", error);
    }
  }

  return { ids: allIds, dates };
}

export async function deleteAllProblemProgress(userId: string) {
  const { error } = await supabase
    .from("problem_progress")
    .delete()
    .eq("user_id", userId);

  if (error) {
    if (error.code === "PGRST116") {
      logger.info("[deleteAllProblemProgress] No rows found to delete");
    } else {
      logSupabaseError("deleteAllProblemProgress", error);
      throw error;
    }
  }
}
