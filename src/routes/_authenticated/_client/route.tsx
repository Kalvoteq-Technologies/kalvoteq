import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireRole } from "@/lib/roles";

export const Route = createFileRoute("/_authenticated/_client")({
  beforeLoad: async ({ location }) => {
    await requireRole("client", location.href);
  },
  component: () => <Outlet />,
});
