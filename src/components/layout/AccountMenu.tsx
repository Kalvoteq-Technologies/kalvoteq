import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  LayoutDashboard,
  LogOut,
  PenLine,
  Rocket,
  ShieldCheck,
  User as UserIcon,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { avatarUrlQuery, initialsFrom, myProfileQuery } from "@/lib/avatars";
import { ROLE_LABELS } from "@/lib/roles";

export function AccountMenu({ onNavigate }: { onNavigate?: () => void }) {
  const { user, loading, roles, isAdmin, hasRole } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery(myProfileQuery(user?.id));
  const { data: avatarUrl } = useQuery(avatarUrlQuery(profile?.avatar_url));

  if (loading) return null;

  if (!user) {
    return (
      <Button asChild variant="ghost" size="sm" onClick={onNavigate}>
        <Link to="/auth">Sign in</Link>
      </Button>
    );
  }

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    onNavigate?.();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <Avatar className="h-7 w-7">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-[11px]">
              {initialsFrom(profile?.display_name, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="truncate">
          {profile?.display_name || user.email}
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {roles.length ? roles.map((r) => ROLE_LABELS[r]).join(" · ") : "No access granted yet"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdmin && (
          <>
            <DropdownMenuItem asChild onClick={onNavigate}>
              <Link to="/admin">
                <PenLine className="mr-2 h-4 w-4" /> Editorial workspace
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={onNavigate}>
              <Link to="/admin/delivery">
                <Briefcase className="mr-2 h-4 w-4" /> Client delivery
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={onNavigate}>
              <Link to="/admin/team">
                <Users className="mr-2 h-4 w-4" /> Team & access
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {hasRole("client") && (
          <DropdownMenuItem asChild onClick={onNavigate}>
            <Link to="/portal">
              <LayoutDashboard className="mr-2 h-4 w-4" /> Client portal
            </Link>
          </DropdownMenuItem>
        )}
        {hasRole("developer") && (
          <DropdownMenuItem asChild onClick={onNavigate}>
            <Link to="/workspace">
              <ShieldCheck className="mr-2 h-4 w-4" /> Developer workspace
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild onClick={onNavigate}>
          <Link to="/onboarding">
            <Rocket className="mr-2 h-4 w-4" /> Getting started
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild onClick={onNavigate}>
          <Link to="/account">
            <UserIcon className="mr-2 h-4 w-4" /> Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
