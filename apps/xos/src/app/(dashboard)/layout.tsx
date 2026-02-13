import { Sidebar } from "@/components/layout/sidebar";
import { CeoModeToggle } from "@/components/layout/ceo-mode-toggle";

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <div className="flex justify-end mb-4">
          <CeoModeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
