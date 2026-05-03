import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/session";
import LogoutButton from "@/components/LogoutButton";
import LocaleSwitcher from "@/components/LocaleSwitcher";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const t = await getTranslations("nav");

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="w-full max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-extrabold text-primary-700 text-base truncate">
              {session.mill_name}
            </span>
            <span className="text-xs text-neutral-500">
              {session.name} · {t(`roles.${session.role}`)}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LocaleSwitcher />
            <LogoutButton />
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
