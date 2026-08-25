import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireRole } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/_developer")({
  beforeLoad: async ({ location }) => {
    await requireRole("developer", location.href);
  },
  component: () => <Outlet />,
});
