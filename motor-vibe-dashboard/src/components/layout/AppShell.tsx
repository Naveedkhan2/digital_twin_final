import { Outlet } from "react-router-dom";

/** Full-app background only — navigation is the hamburger drawer (see AppTopBar on each page). */
export function AppShell() {
  return (
    <div className="min-h-screen bg-company-gradient text-white">
      <Outlet />
    </div>
  );
}
