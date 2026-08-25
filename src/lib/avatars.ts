import { queryOptions } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";

export const AVATARS_BUCKET = "avatars";
export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const AVATAR_SIZE = 512;

export interface MyProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export const myProfileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["profile", "mine", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<MyProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_url")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as MyProfile | null) ?? null;
    },
  });

/** Center-crop to a square and downscale in the browser so avatars stay small. */
async function toSquarePng(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  const target = Math.min(AVATAR_SIZE, side);

  const canvas = document.createElement("canvas");
  canvas.width = target;
  canvas.height = target;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process that image");
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, target, target);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png", 0.92),
  );
  if (!blob) throw new Error("Could not process that image");
  return blob;
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (file.size > MAX_AVATAR_BYTES) throw new Error("Profile picture must be smaller than 5 MB");
  if (file.type && !ACCEPTED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Upload a PNG, JPEG, or WebP image");
  }

  const square = await toSquarePng(file);
  const path = `${userId}/${Date.now()}-avatar.png`;

  const { error: uploadError } = await supabase.storage
    .from(AVATARS_BUCKET)
    .upload(path, square, { cacheControl: "3600", upsert: false, contentType: "image/png" });
  if (uploadError) throw uploadError;

  const { data: existing } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", userId);
  if (error) {
    await supabase.storage.from(AVATARS_BUCKET).remove([path]);
    throw error;
  }

  const previous = (existing as { avatar_url: string | null } | null)?.avatar_url;
  if (previous && previous !== path) {
    await supabase.storage.from(AVATARS_BUCKET).remove([previous]);
  }
  return path;
}

export async function removeAvatar(userId: string, path: string): Promise<void> {
  const { error } = await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
  if (error) throw error;
  await supabase.storage.from(AVATARS_BUCKET).remove([path]);
}

export async function saveDisplayName(userId: string, displayName: string): Promise<void> {
  const trimmed = displayName.trim();
  if (trimmed.length < 2) throw new Error("Enter at least 2 characters");
  if (trimmed.length > 80) throw new Error("Keep your name under 80 characters");
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: trimmed })
    .eq("id", userId);
  if (error) throw error;
}

/** Short-lived signed URL — the avatars bucket is private. */
export async function getAvatarUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(AVATARS_BUCKET).createSignedUrl(path, 600);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not load that image");
  return data.signedUrl;
}

export const avatarUrlQuery = (path: string | null | undefined) =>
  queryOptions({
    queryKey: ["avatar", path],
    enabled: Boolean(path),
    staleTime: 8 * 60 * 1000,
    queryFn: () => getAvatarUrl(path!),
  });

export function initialsFrom(
  name: string | null | undefined,
  email: string | null | undefined,
): string {
  const source = (name ?? "").trim() || (email ?? "").split("@")[0] || "";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((p) => p[0]!);
  return (letters.join("") || "?").toUpperCase();
}
