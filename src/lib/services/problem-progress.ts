import { supabase } from "@/lib/supabase";
import { PROBLEMS } from "@/constants/problems";
import { logger } from "@/lib/logger";

function extractSlug(link: string): string {
  const parts = link.replace(/\/$/, "").split("/");
  return parts[parts.length - 1] ?? "";
}

const slugCache = new Map<number, string>();
function getProblemSlug(id: number): string {
  if (!slugCache.has(id)) {
    const p = PROBLEMS.find((x) => x.id === id);
    slugCache.set(id, p ? extractSlug(p.link) : String(id));
  }
  return slugCache.get(id) ?? String(id);
}

function logSupabaseError(label: string, error: unknown) {
  const e = error as {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  };
  logger.error(`[${label}]`, JSON.stringify(error));
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
    if (error && error.code !== "PGRST116") {
      logSupabaseError("deleteProblemProgress", error);
      throw error;
    }
  }
}

export async function getSolvedProblemSlugs(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("problem_progress")
    .select("problem_slug")
    .eq("user_id", userId)
    .eq("status", "Solved");

  if (error) {
    logSupabaseError("getSolvedProblemSlugs", error);
    throw error;
  }
  return (data ?? []).map((r) => r.problem_slug);
}

export async function syncSolvedProblems(
  userId: string,
  localIds: number[],
): Promise<number[]> {
  let remoteSlugs: string[];
  try {
    remoteSlugs = await getSolvedProblemSlugs(userId);
  } catch (err) {
    logSupabaseError("syncSolvedProblems-fetch", err);
    remoteSlugs = [];
  }

  const remoteIds = remoteSlugs
    .map((slug) => PROBLEMS.find((p) => extractSlug(p.link) === slug)?.id)
    .filter((id): id is number => id != null);

  const allIds = [...new Set([...remoteIds, ...localIds])];

  const remoteSlugSet = new Set(remoteSlugs);
  const toUpload = localIds.filter((id) => {
    const slug = getProblemSlug(id);
    return !remoteSlugSet.has(slug);
  });

  if (toUpload.length > 0) {
    const rows = toUpload.map((id) => ({
      user_id: userId,
      problem_slug: getProblemSlug(id),
      status: "Solved" as const,
      last_solved_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("problem_progress").upsert(rows, {
      onConflict: "user_id,problem_slug",
      ignoreDuplicates: true,
    });
    if (error) {
      logSupabaseError("syncSolvedProblems-upload", error);
    }
  }

  return allIds;
}
