import { requireSession } from "@/lib/auth/session";
import PageContainer from "@/components/PageContainer";
import type { UserRole } from "@/types/database";

const ROLE_LABEL: Record<UserRole, string> = {
  owner: "Owner view — full access and intelligence reports.",
  manager: "Manager view — full operational access.",
  munim: "Munim view — data entry and lot capture.",
};

export default async function DashboardPage() {
  const session = await requireSession();

  return (
    <PageContainer className="py-8 flex flex-col gap-6">
      <div>
        <p className="text-neutral-500 text-sm">Namaste 👋</p>
        <h1 className="text-2xl font-bold text-neutral-800 mt-0.5">
          {session.name}
        </h1>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <p className="text-sm font-semibold text-primary-700 uppercase tracking-wide mb-1">
          {session.role}
        </p>
        <p className="text-neutral-600">{ROLE_LABEL[session.role]}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-400 text-sm text-center">
        Logbook features coming in step 4 →
      </div>
    </PageContainer>
  );
}
