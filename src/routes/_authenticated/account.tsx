import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AvatarUpload } from "@/components/account/AvatarUpload";
import { PageHero, Section } from "@/components/site/Primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { myProfileQuery, saveDisplayName } from "@/lib/avatars";
import { ROLE_LABELS } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Your account — kalvoteq" },
      { name: "description", content: "Update your kalvoteq display name and profile picture." },
      { property: "og:title", content: "Your account — kalvoteq" },
      { property: "og:description", content: "Manage your kalvoteq profile details." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useQuery(myProfileQuery(user?.id));
  const [name, setName] = useState("");

  useEffect(() => {
    if (profile) setName(profile.display_name ?? "");
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You are signed out");
      await saveDisplayName(user.id, name);
    },
    onSuccess: async () => {
      toast.success("Profile updated");
      await queryClient.invalidateQueries({ queryKey: ["profile", "mine", user?.id] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save your profile"),
  });

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Your profile"
        intro="Your name and picture appear across the kalvoteq portals and workspace."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            <AvatarUpload
              userId={user?.id}
              avatarPath={profile?.avatar_url}
              displayName={profile?.display_name}
              email={user?.email}
            />

            <form
              className="space-y-5 rounded-xl border border-border bg-card p-7"
              onSubmit={(e) => {
                e.preventDefault();
                save.mutate();
              }}
            >
              <h2 className="text-lg font-semibold">Display name</h2>
              <div className="space-y-2">
                <Label htmlFor="display_name">Name</Label>
                <Input
                  id="display_name"
                  value={name}
                  maxLength={80}
                  disabled={isLoading}
                  placeholder="Your full name"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={save.isPending || isLoading}>
                {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Save changes
              </Button>
            </form>
          </div>

          <aside className="h-fit rounded-xl border border-border bg-surface p-6 text-sm">
            <h2 className="text-sm font-semibold">Account</h2>
            <p className="mt-3 break-words text-muted-foreground">{user?.email}</p>
            <p className="mt-2 text-muted-foreground">
              {roles.length ? roles.map((r) => ROLE_LABELS[r]).join(" · ") : "No access granted yet"}
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
