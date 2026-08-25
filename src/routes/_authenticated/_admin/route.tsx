import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireRole } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/_admin")({
  beforeLoad: async ({ location }) => {
    await requireRole("admin", location.href);
  },
  component: () => <Outlet />,
});
