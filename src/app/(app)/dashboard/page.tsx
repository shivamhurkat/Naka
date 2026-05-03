import { getTranslations } from "next-intl/server";
import { requireSession } from "@/lib/auth/session";
import PageContainer from "@/components/PageContainer";
import type { UserRole } from "@/types/database";

export default async function DashboardPage() {
  const session = await requireSession();
  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");

  const roleMessages: Record<UserRole, string> = {
    owner: t("ownerMessage"),
    manager: t("managerMessage"),
    munim: t("munimMessage"),
  };

  return (
    <PageContainer className="py-8 flex flex-col gap-6">
      <div>
        <p className="text-neutral-500 text-sm">{t("greeting")} 👋</p>
        <h1 className="text-2xl font-bold text-neutral-800 mt-0.5">
          {session.name}
        </h1>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
          {tNav(`roles.${session.role}`)}
        </p>
        <p className="text-neutral-600">{roleMessages[session.role]}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-400 text-sm text-center">
        {t("comingSoon")}
      </div>
    </PageContainer>
  );
}
