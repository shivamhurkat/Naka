import { requireSession } from "@/lib/auth/session";
import LogoutButton from "@/components/LogoutButton";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top bar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="w-full max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-primary-700 text-base">
              {session.mill_name}
            </span>
            <span className="text-xs text-neutral-500">
              {session.name} ·{" "}
              <span className="capitalize">{session.role}</span>
            </span>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
