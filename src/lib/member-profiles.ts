import { queryOptions } from "@tanstack/react-query";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";

export interface ClientProfile {
  user_id: string;
  company_name: string;
  website: string | null;
  industry: string | null;
  company_size: string | null;
  country: string | null;
  role_title: string | null;
  needs: string;
  logo_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeveloperProfile {
  user_id: string;
  headline: string;
  company_name: string | null;
  years_experience: number;
  skills: string[];
  primary_stack: string | null;
  availability: string | null;
  timezone: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

const optionalUrl = z
  .string()
  .trim()
  .max(255)
  .optional()
  .transform((v) => (v ? v : ""))
  .refine(
    (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
    "Enter a full URL starting with https://",
  );

const optionalText = (max = 120) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v ?? "");

export const clientProfileSchema = z.object({
  company_name: z.string().trim().min(2, "Company name is required").max(120),
  website: optionalUrl,
  industry: optionalText(),
  company_size: optionalText(60),
  country: optionalText(80),
  role_title: optionalText(),
  needs: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .transform((v) => v ?? ""),
});

export const developerProfileSchema = z.object({
  headline: z.string().trim().min(2, "Add a short headline").max(140),
  company_name: optionalText(),
  years_experience: z.coerce.number().int().min(0, "Must be 0 or more").max(60),
  skills: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => v ?? ""),
  primary_stack: optionalText(),
  availability: optionalText(60),
  timezone: optionalText(60),
  github_url: optionalUrl,
  portfolio_url: optionalUrl,
});

export type ClientProfileInput = z.infer<typeof clientProfileSchema>;
export type DeveloperProfileInput = z.infer<typeof developerProfileSchema>;

const nullify = (value: string) => (value.trim() === "" ? null : value.trim());

export const myClientProfileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["client-profile", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<ClientProfile | null> => {
      const { data, error } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as ClientProfile | null) ?? null;
    },
  });

export const myDeveloperProfileQuery = (userId: string | undefined) =>
  queryOptions({
    queryKey: ["developer-profile", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<DeveloperProfile | null> => {
      const { data, error } = await supabase
        .from("developer_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data as DeveloperProfile | null) ?? null;
    },
  });

export async function saveClientProfile(userId: string, input: ClientProfileInput) {
  const { error } = await supabase.from("client_profiles").upsert(
    {
      user_id: userId,
      company_name: input.company_name,
      website: nullify(input.website),
      industry: nullify(input.industry),
      company_size: nullify(input.company_size),
      country: nullify(input.country),
      role_title: nullify(input.role_title),
      needs: input.needs,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function saveDeveloperProfile(userId: string, input: DeveloperProfileInput) {
  const { error } = await supabase.from("developer_profiles").upsert(
    {
      user_id: userId,
      headline: input.headline,
      company_name: nullify(input.company_name),
      years_experience: input.years_experience,
      skills: input.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      primary_stack: nullify(input.primary_stack),
      availability: nullify(input.availability),
      timezone: nullify(input.timezone),
      github_url: nullify(input.github_url),
      portfolio_url: nullify(input.portfolio_url),
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

/* ---------- Company logo (private bucket, owner + admin + developer read) ---------- */

export const CLIENT_LOGOS_BUCKET = "client-logos";
export const MAX_LOGO_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

export async function uploadClientLogo(userId: string, file: File): Promise<string> {
  if (file.size > MAX_LOGO_BYTES) throw new Error("Logo must be smaller than 2 MB");
  if (file.type && !ACCEPTED_LOGO_TYPES.includes(file.type)) {
    throw new Error("Upload a PNG, JPEG, SVG, or WebP image");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-60);
  const path = `${userId}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(CLIENT_LOGOS_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/png",
    });
  if (uploadError) throw uploadError;

  const { data: existing } = await supabase
    .from("client_profiles")
    .select("logo_path")
    .eq("user_id", userId)
    .maybeSingle();

  const { error } = await supabase
    .from("client_profiles")
    .update({ logo_path: path })
    .eq("user_id", userId);
  if (error) {
    await supabase.storage.from(CLIENT_LOGOS_BUCKET).remove([path]);
    throw error;
  }

  const previous = (existing as { logo_path: string | null } | null)?.logo_path;
  if (previous && previous !== path) {
    await supabase.storage.from(CLIENT_LOGOS_BUCKET).remove([previous]);
  }
  return path;
}

export async function removeClientLogo(userId: string, path: string): Promise<void> {
  const { error } = await supabase
    .from("client_profiles")
    .update({ logo_path: null })
    .eq("user_id", userId);
  if (error) throw error;
  await supabase.storage.from(CLIENT_LOGOS_BUCKET).remove([path]);
}

/** Short-lived signed URL — the logo bucket is private. */
export async function getClientLogoUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(CLIENT_LOGOS_BUCKET)
    .createSignedUrl(path, 300);
  if (error || !data?.signedUrl) throw error ?? new Error("Could not load that logo");
  return data.signedUrl;
}

export const clientLogoUrlQuery = (path: string | null | undefined) =>
  queryOptions({
    queryKey: ["client-logo", path],
    enabled: Boolean(path),
    staleTime: 4 * 60 * 1000,
    queryFn: () => getClientLogoUrl(path!),
  });
