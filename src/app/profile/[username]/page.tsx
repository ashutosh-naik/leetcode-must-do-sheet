"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Pencil, Check, X, Loader2, Camera } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import {
  getProfileByUsername,
  updateProfile,
  type Profile,
} from "@/lib/services/profile";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationInput } from "@/components/ui/location-input";
import { CropModal } from "@/components/common/crop-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { validateUsername, validateProfileField, isUsernameTaken } from "@/lib/username";

function EditableField({
  label,
  value,
  isEditing,
  onStartEdit,
  onCancel,
  onSave,
  saving,
  children,
}: {
  label: string;
  value: string | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="py-3 border-b border-border last:border-b-0 min-h-[48px]">
      <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-1">
        {label}
      </span>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center">{children}</div>
          ) : (
            <span className="text-sm text-foreground break-all">
              {value || (
                <span className="italic text-muted-foreground">Not set</span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartEdit}
              className="text-muted-foreground hover:text-foreground cursor-pointer gap-1"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : (
            <>
              <Button
                size="sm"
                disabled={saving}
                onClick={onSave}
                className="bg-primary hover:bg-primary/90 text-white cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-muted-foreground hover:text-foreground cursor-pointer gap-1"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfileUsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<Record<string, string>>({});
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(
    (key: string, currentValue: string | null) => {
      setEditing((prev) => ({ ...prev, [key]: true }));
      setForm((prev) => ({ ...prev, [key]: currentValue ?? "" }));
    },
    [],
  );

  const cancelEdit = useCallback((key: string) => {
    setEditing((prev) => ({ ...prev, [key]: false }));
    setForm((prev) => ({ ...prev, [key]: "" }));
  }, []);

  const handleAvatarFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be under 2MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [toast]);

  const handleCropSave = useCallback(
    async (dataUrl: string) => {
      if (!user || !profile || user.id !== profile.id) return;
      setCropImageSrc(null);
      setSaving(true);
      try {
        // Convert base64 data URL to blob for Supabase Storage
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const filePath = `${user.id}/avatar.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;
        const updated = await updateProfile(user.id, { avatar_url: publicUrl });
        setProfile(updated);
        toast("Profile picture updated", "success");
        window.dispatchEvent(new Event("profile-updated"));
      } catch {
        toast("Failed to update profile picture", "error");
      } finally {
        setSaving(false);
      }
    },
    [user, profile, toast],
  );

  const saveField = useCallback(
    async (key: string, value: string) => {
      if (!user || !profile || user.id !== profile.id) return;
      // Validate before saving
      if (key === "username") {
        const err = validateUsername(value);
        if (err) { toast(err, "error"); return; }
        if (await isUsernameTaken(value, user.id)) {
          toast("Username already taken, choose a different one", "error");
          return;
        }
      } else {
        const err = validateProfileField(key, value);
        if (err) { toast(err, "error"); return; }
      }
      setSaving(true);
      try {
        const updated = await updateProfile(user.id, {
          [key]: value || null,
        });
        setProfile(updated);
        setEditing((prev) => ({ ...prev, [key]: false }));
        toast("Profile updated", "success");
        window.dispatchEvent(new Event("profile-updated"));

        if (key === "username" && updated.username) {
          router.replace(`/profile/${updated.username}`);
        }
      } catch {
        toast("Failed to update profile", "error");
      } finally {
        setSaving(false);
      }
    },
    [user, profile, toast, router],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { username } = await params;
        const p = await getProfileByUsername(username);
        if (!cancelled) {
          setProfile(p);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params, user?.id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          User not found
        </h1>
        <p className="text-muted-foreground mt-2">
          No profile exists with this username.
        </p>
      </div>
    );
  }

  const isOwn = user?.id === profile.id;
  const avatarUrl =
    profile.avatar_url ?? user?.user_metadata?.avatar_url ?? null;
  const displayName =
    profile.display_name ??
    profile.name ??
    user?.user_metadata?.name ??
    "User";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        Profile
      </h1>

      {/* Avatar */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {isOwn ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change profile picture"
              className="relative size-20 rounded-full bg-muted hover:bg-muted hover:ring-2 hover:ring-primary/50 transition-all group shrink-0 p-0 overflow-hidden"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors group pointer-events-none">
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Button>
          ) : (
            <div className="relative size-20 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarFileChange}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-lg font-semibold truncate">
              {displayName}
            </h2>
            {profile.username && (
              <p className="text-sm text-muted-foreground">
                @{profile.username}
              </p>
            )}
          </div>
        </div>
      </div>

      {cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          onCrop={handleCropSave}
          onCancel={() => setCropImageSrc(null)}
        />
      )}

      {/* Profile Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Profile Info
        </h3>

        <EditableField
          label="Display Name"
          value={profile.display_name ?? null}
          isEditing={!!editing.display_name}
          onStartEdit={() =>
            startEdit("display_name", profile.display_name ?? null)
          }
          onCancel={() => cancelEdit("display_name")}
          onSave={() => saveField("display_name", form.display_name)}
          saving={saving}
        >
          <Input
            placeholder="Your display name"
            value={form.display_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                display_name: e.target.value,
              }))
            }
            className="text-sm flex-1"
          />
        </EditableField>

        <EditableField
          label="Username"
          value={profile.username ?? null}
          isEditing={!!editing.username}
          onStartEdit={() =>
            startEdit("username", profile.username ?? null)
          }
          onCancel={() => cancelEdit("username")}
          onSave={() => saveField("username", form.username)}
          saving={saving}
        >
          <Input
            placeholder="Choose a username"
            value={form.username}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                username: e.target.value,
              }))
            }
            className="text-sm flex-1"
          />
        </EditableField>
      </div>

      {/* Personal Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Personal Info
        </h3>

        <EditableField
          label="Gender"
          value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null}
          isEditing={!!editing.gender}
          onStartEdit={() => startEdit("gender", profile.gender ?? null)}
          onCancel={() => cancelEdit("gender")}
          onSave={() => saveField("gender", form.gender)}
          saving={saving}
        >
          <Select
            value={form.gender || "none"}
            onValueChange={(v) =>
              setForm((prev) => ({ ...prev, gender: v === "none" ? "" : v }))
            }
          >
            <SelectTrigger className="flex-1 h-9 cursor-pointer">
              <SelectValue placeholder="Prefer not to say" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Prefer not to say</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </EditableField>

        <EditableField
          label="Location"
          value={profile.location ?? null}
          isEditing={!!editing.location}
          onStartEdit={() =>
            startEdit("location", profile.location ?? null)
          }
          onCancel={() => cancelEdit("location")}
          onSave={() => saveField("location", form.location)}
          saving={saving}
        >
          <LocationInput
            value={form.location || null}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, location: val ?? "" }))
            }
          />
        </EditableField>

        <EditableField
          label="Birthday"
          value={
            profile.birthday
              ? new Date(profile.birthday + "T00:00:00Z").toLocaleDateString(
                  "en-GB",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    timeZone: "UTC",
                  },
                )
              : null
          }
          isEditing={!!editing.birthday}
          onStartEdit={() =>
            startEdit("birthday", profile.birthday ?? null)
          }
          onCancel={() => cancelEdit("birthday")}
          onSave={() => saveField("birthday", form.birthday)}
          saving={saving}
        >
          <DatePicker
            value={form.birthday || null}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, birthday: val ?? "" }))
            }
          />
        </EditableField>
      </div>

      {/* Social Links */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Social Links
        </h3>

        <EditableField
          label="GitHub"
          value={profile.github_url ?? null}
          isEditing={!!editing.github_url}
          onStartEdit={() =>
            startEdit("github_url", profile.github_url ?? null)
          }
          onCancel={() => cancelEdit("github_url")}
          onSave={() => saveField("github_url", form.github_url)}
          saving={saving}
        >
          <Input
            placeholder="https://github.com/username"
            value={form.github_url}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                github_url: e.target.value,
              }))
            }
            className="text-sm flex-1"
          />
        </EditableField>

        <EditableField
          label="LinkedIn"
          value={profile.linkedin_url ?? null}
          isEditing={!!editing.linkedin_url}
          onStartEdit={() =>
            startEdit("linkedin_url", profile.linkedin_url ?? null)
          }
          onCancel={() => cancelEdit("linkedin_url")}
          onSave={() => saveField("linkedin_url", form.linkedin_url)}
          saving={saving}
        >
          <Input
            placeholder="https://linkedin.com/in/username"
            value={form.linkedin_url}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                linkedin_url: e.target.value,
              }))
            }
            className="text-sm flex-1"
          />
        </EditableField>
      </div>
    </div>
  );
}
