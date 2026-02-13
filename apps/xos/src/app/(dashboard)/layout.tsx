import { getSession } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { CeoModeToggle } from "@/components/layout/ceo-mode-toggle";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSession();
  const canAccessAdminPages = user ? canAccessAdmin(user) : false;
  return (
    <div className="flex min-h-screen">
      <Sidebar canAccessAdmin={canAccessAdminPages} />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-4">
          <CeoModeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
