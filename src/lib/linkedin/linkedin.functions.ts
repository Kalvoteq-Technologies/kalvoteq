import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/require-admin";
import { SITE_URL } from "@/lib/welcome.shared";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const getLinkedInAuthUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ url: string }> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { createOAuthState } = await import("./oauth-state.server");
    const { buildAuthorizationUrl } = await import("./client.server");
    return { url: buildAuthorizationUrl(createOAuthState(context.userId)) };
  });

export const getLinkedInStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ connected: boolean; organizationName?: string }> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { getConnectedAccount } = await import("./account.server");
    const account = await getConnectedAccount().catch(() => null);
    return account
      ? { connected: true, organizationName: account.organizationName }
      : { connected: false };
  });

export const disconnectLinkedIn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("linkedin_accounts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw error;
    return { ok: true };
  });

export interface SocialPostRow {
  id: string;
  post_id: string;
  platform: string;
  content: string;
  status: "draft" | "published" | "failed";
  published_at: string | null;
  external_post_id: string | null;
  error: string | null;
  created_at: string;
  posts: { title: string; slug: string } | null;
}

const sel = (s: string): string => s;

export const listSocialPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SocialPostRow[]> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("social_posts")
      .select(sel("*, posts(title, slug)"))
      .order("created_at", { ascending: false })
      .returns<SocialPostRow[]>();
    if (error) throw error;
    return data ?? [];
  });

const postIdInput = z.object({ postId: z.string().uuid() });

export const generateLinkedInPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => postIdInput.parse(data))
  .handler(async ({ context, data }): Promise<SocialPostRow> => {
    await requireAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: post, error: postError } = await supabaseAdmin
      .from("posts")
      .select("title, excerpt, content, slug, status")
      .eq("id", data.postId)
      .single();
    if (postError) throw postError;
    if (post.status !== "published") {
      throw new Error("Only published articles can be turned into a LinkedIn post.");
    }

    const { generateValidated } = await import("@/lib/ai/anthropic.server");
    const {
      LINKEDIN_SYSTEM_PROMPT,
      buildLinkedInPostPrompt,
      linkedinPostToolSchema,
      linkedinPostSchema,
      composeLinkedInPostText,
    } = await import("./prompts");

    const draft = await generateValidated(
      LINKEDIN_SYSTEM_PROMPT,
      buildLinkedInPostPrompt({
        articleTitle: post.title,
        articleExcerpt: post.excerpt,
        articleContentText: stripHtml(post.content),
      }),
      linkedinPostToolSchema,
      linkedinPostSchema,
    );

    const content = composeLinkedInPostText(draft, `${SITE_URL}/insights/${post.slug}`);

    const { data: row, error: insertError } = await supabaseAdmin
      .from("social_posts")
      .insert({
        post_id: data.postId,
        platform: "linkedin",
        content,
        status: "draft",
        created_by: context.userId,
      })
      .select(sel("*, posts(title, slug)"))
      .single<SocialPostRow>();
    if (insertError) throw insertError;
    return row;
  });

const updateContentInput = z.object({
  id: z.string().uuid(),
  content: z.string().trim().min(1).max(3000),
});

export const updateSocialPostContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => updateContentInput.parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("social_posts")
      .update({ content: data.content })
      .eq("id", data.id)
      .in("status", ["draft", "failed"]);
    if (error) throw error;
    return { ok: true };
  });

const socialPostIdInput = z.object({ id: z.string().uuid() });

export const publishSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => socialPostIdInput.parse(data))
  .handler(async ({ context, data }) => {
    await requireAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error: rowError } = await supabaseAdmin
      .from("social_posts")
      .select("id, content, status")
      .eq("id", data.id)
      .single();
    if (rowError) throw rowError;
    if (row.status === "published") throw new Error("This post has already been published.");

    const { getConnectedAccount } = await import("./account.server");
    const account = await getConnectedAccount();
    if (!account) throw new Error("LinkedIn is not connected. Connect it first.");

    try {
      const { createLinkedInPost } = await import("./client.server");
      const externalPostId = await createLinkedInPost(
        account.accessToken,
        account.organizationUrn,
        row.content,
      );
      await supabaseAdmin
        .from("social_posts")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          external_post_id: externalPostId,
          error: null,
        })
        .eq("id", data.id);
      return { ok: true, externalPostId };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error publishing to LinkedIn";
      await supabaseAdmin
        .from("social_posts")
        .update({ status: "failed", error: message })
        .eq("id", data.id);
      throw new Error(message);
    }
  });
