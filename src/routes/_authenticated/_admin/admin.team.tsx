import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHero, Section } from "@/components/site/Primitives";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { initialsFrom } from "@/lib/avatars";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, ROLES, type AppRole } from "@/lib/roles";
import { createTeamMember, listTeam, revokeAllAccess, setTeamRole, type TeamMember } from "@/lib/team.functions";
import { cn } from "@/lib/utils";



export const Route = createFileRoute("/_authenticated/_admin/admin/team")({
  head: () => ({
    meta: [
      { title: "Team & access — kalvoteq Admin" },
      {
        name: "description",
        content: "Create accounts, grant admin, client, or developer roles, and revoke access safely.",
      },
      { property: "og:title", content: "Team & access — kalvoteq Admin" },
      { property: "og:description", content: "Manage platform accounts and access levels." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TeamPage,
});

function generatePassword(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return `Nh-${Array.from(bytes, (b) => b.toString(36).padStart(2, "0")).join("")}`;
}

function TeamPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const fetchTeam = useServerFn(listTeam);
  const createFn = useServerFn(createTeamMember);
  const setRoleFn = useServerFn(setTeamRole);
  const revokeFn = useServerFn(revokeAllAccess);

  const { data: team = [], isLoading, error } = useQuery({
    queryKey: ["team", "members"],
    queryFn: () => fetchTeam(),
  });

  const [pendingRevoke, setPendingRevoke] = useState<TeamMember | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["team", "members"] });

  const toggleRole = useMutation({
    mutationFn: (vars: { userId: string; role: AppRole; granted: boolean }) => setRoleFn({ data: vars }),
    onSuccess: (_d, vars) => {
      void invalidate();
      void queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success(`${ROLE_LABELS[vars.role]} access ${vars.granted ? "granted" : "revoked"}`);
    },
    onError: (e: Error) => toast.error(e.message || "Could not change that role"),
  });

  const revoke = useMutation({
    mutationFn: (userId: string) => revokeFn({ data: { userId } }),
    onSuccess: () => {
      void invalidate();
      setPendingRevoke(null);
      toast.success("All access revoked");
    },
    onError: (e: Error) => toast.error(e.message || "Could not revoke access"),
  });

  return (
    <>
      <PageHero
        eyebrow="Administration"
        title="Team & access"
        intro="Create accounts, decide who reaches the editorial workspace, the client portal, or the developer workspace, and revoke access when someone leaves."
      >
        <Button asChild variant="outline">
          <Link to="/admin">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to articles
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/admin/documents">Developer documents</Link>
        </Button>
        <CreateUserDialog
          onCreate={async (values) => {
            await createFn({ data: values });
            await invalidate();
          }}
        />
      </PageHero>

      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {ROLES.map((role) => (
            <div key={role} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
                <p className="font-semibold">{ROLE_LABELS[role]}</p>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading people…</p>
        ) : error ? (
          <p className="mt-10 text-sm text-destructive">Could not load the team list.</p>
        ) : (
          <ul className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
            {team.map((person) => {
              const isSelf = person.id === user?.id;
              return (
                <li key={person.id} className="flex flex-wrap items-center gap-4 p-5">
                  <Avatar className="h-10 w-10 shrink-0">
                    {person.avatarUrl ? <AvatarImage src={person.avatarUrl} alt="" /> : null}
                    <AvatarFallback className="text-xs">
                      {initialsFrom(person.displayName, person.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {person.displayName || person.email || "Unnamed user"}
                      {isSelf && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {person.email}
                      {person.roles.length === 0 ? " · no access granted yet" : ""}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => {
                      const granted = person.roles.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          aria-pressed={granted}
                          aria-label={`${granted ? "Revoke" : "Grant"} ${ROLE_LABELS[role]} for ${person.email ?? person.id}`}
                          disabled={toggleRole.isPending}
                          onClick={() =>
                            toggleRole.mutate({ userId: person.id, role, granted: !granted })
                          }
                          className={cn(
                            "rounded-full border border-border px-3 py-1 text-sm transition-colors disabled:opacity-50",
                            granted
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      );
                    })}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={isSelf || person.roles.length === 0}
                      onClick={() => setPendingRevoke(person)}
                    >
                      Revoke all
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          <Badge variant="secondary" className="mr-2">
            Safety
          </Badge>
          You cannot remove your own admin role, and the last remaining admin can never be revoked — so the platform
          stays reachable.
        </p>
      </Section>

      <AlertDialog open={pendingRevoke !== null} onOpenChange={(open) => !open && setPendingRevoke(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke all access?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRevoke?.email} will keep their account but lose every role, so they can no longer open the admin,
              client, or developer areas. You can grant roles again at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (pendingRevoke) revoke.mutate(pendingRevoke.id);
              }}
            >
              {revoke.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Revoke access
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface CreateValues {
  email: string;
  displayName: string;
  password: string;
  roles: AppRole[];
}

function CreateUserDialog({ onCreate }: { onCreate: (values: CreateValues) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState(generatePassword);
  const [roles, setRoles] = useState<AppRole[]>(["client"]);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);


    try {
      await onCreate({ email: email.trim(), displayName: displayName.trim(), password, roles });
      toast.success("Account created", { description: "Share the temporary password securely." });
      setOpen(false);
      setEmail("");
      setDisplayName("");
      setPassword(generatePassword());
      setRoles(["client"]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create that account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-1.5 h-4 w-4" /> New user
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create a user</DialogTitle>
            <DialogDescription>
              The account is confirmed immediately. Share the temporary password over a secure channel and ask them to
              change it after the first sign-in.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Work email</Label>
              <Input
                id="new-email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="person@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-name">Display name</Label>
              <Input
                id="new-name"
                maxLength={120}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Kadri Tamm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Temporary password</Label>
              <div className="flex gap-2">
                <Input
                  id="new-password"
                  required
                  minLength={10}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>
                  Regenerate
                </Button>
              </div>
            </div>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Roles</legend>
              <div className="flex flex-wrap gap-4 pt-1">
                {ROLES.map((role) => (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={roles.includes(role)}
                      onCheckedChange={(checked) =>
                        setRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)))
                      }
                    />
                    {ROLE_LABELS[role]}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Create user
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
