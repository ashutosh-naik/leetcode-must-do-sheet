"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { User, Pencil, Check, X, Loader2, Camera } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/providers/auth-provider";
import {
  getProfileByUsername,
  updateProfile,
  type Profile,
} from "@/lib/services/profile";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationInput } from "@/components/ui/location-input";
import { CropModal } from "@/components/common/crop-modal";

function EditableField({
  label,
  value,
  isEditing,
  onStartEdit,
  onCancel,
  children,
}: {
  label: string;
  value: string | null;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-b-0 min-h-[48px]">
      <div className="flex-1 min-w-0">
        <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-1">
          {label}
        </span>
        {isEditing ? (
          <div>{children}</div>
        ) : (
          <span className="text-sm text-foreground break-all">
            {value || (
              <span className="italic text-muted-foreground">Not set</span>
            )}
          </span>
        )}
      </div>
      {!isEditing ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onStartEdit}
          className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0 gap-1"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0 gap-1"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </Button>
      )}
    </div>
  );
}

export default function ProfileUsernamePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { user } = useAuth();
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
    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }, []);

  const handleCropSave = useCallback(
    async (dataUrl: string) => {
      if (!user || !profile || user.id !== profile.id) return;
      setCropImageSrc(null);
      setSaving(true);
      try {
        const updated = await updateProfile(user.id, { avatar_url: dataUrl });
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
          window.history.replaceState(
            null,
            "",
            `/profile/${updated.username}`,
          );
        }
      } catch {
        toast("Failed to update profile", "error");
      } finally {
        setSaving(false);
      }
    },
    [user, profile, toast],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { username } = await params;
      const p = await getProfileByUsername(username);
      if (!cancelled) {
        setProfile(p);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params]);

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
          <button
            type="button"
            onClick={() => isOwn && fileInputRef.current?.click()}
            className={`relative size-20 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 ${isOwn ? "cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all" : ""}`}
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
            {isOwn && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/40 flex items-center justify-center transition-colors group">
                <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </button>
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
        >
          <div className="flex gap-2">
            <Input
              placeholder="Your display name"
              value={form.display_name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  display_name: e.target.value,
                }))
              }
              className="text-sm"
            />
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("display_name", form.display_name)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </EditableField>

        <EditableField
          label="Username"
          value={profile.username ?? null}
          isEditing={!!editing.username}
          onStartEdit={() =>
            startEdit("username", profile.username ?? null)
          }
          onCancel={() => cancelEdit("username")}
        >
          <div className="flex gap-2">
            <Input
              placeholder="Choose a username"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              className="text-sm"
            />
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("username", form.username)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </EditableField>
      </div>

      {/* Personal Info */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Personal Info
        </h3>

        <EditableField
          label="Gender"
          value={profile.gender ?? null}
          isEditing={!!editing.gender}
          onStartEdit={() => startEdit("gender", profile.gender ?? null)}
          onCancel={() => cancelEdit("gender")}
        >
          <div className="flex gap-2">
            <select
              value={form.gender}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, gender: e.target.value }))
              }
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("gender", form.gender)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </EditableField>

        <EditableField
          label="Location"
          value={profile.location ?? null}
          isEditing={!!editing.location}
          onStartEdit={() =>
            startEdit("location", profile.location ?? null)
          }
          onCancel={() => cancelEdit("location")}
        >
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <LocationInput
                value={form.location || null}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, location: val ?? "" }))
                }
              />
            </div>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("location", form.location)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
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
        >
          <div className="flex gap-2 items-start">
            <div className="flex-1">
              <DatePicker
                value={form.birthday || null}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, birthday: val ?? "" }))
                }
              />
            </div>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("birthday", form.birthday)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
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
        >
          <div className="flex gap-2">
            <Input
              placeholder="https://github.com/username"
              value={form.github_url}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  github_url: e.target.value,
                }))
              }
              className="text-sm"
            />
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("github_url", form.github_url)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </EditableField>

        <EditableField
          label="LinkedIn"
          value={profile.linkedin_url ?? null}
          isEditing={!!editing.linkedin_url}
          onStartEdit={() =>
            startEdit("linkedin_url", profile.linkedin_url ?? null)
          }
          onCancel={() => cancelEdit("linkedin_url")}
        >
          <div className="flex gap-2">
            <Input
              placeholder="https://linkedin.com/in/username"
              value={form.linkedin_url}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  linkedin_url: e.target.value,
                }))
              }
              className="text-sm"
            />
            <Button
              size="sm"
              disabled={saving}
              onClick={() => saveField("linkedin_url", form.linkedin_url)}
              className="bg-primary hover:bg-primary/90 text-white cursor-pointer shrink-0"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </EditableField>
      </div>
    </div>
  );
}
