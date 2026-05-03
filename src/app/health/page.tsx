import { createAdminClient } from "@/lib/supabase/admin";
import PageContainer from "@/components/PageContainer";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY === "your-service-role-key-here") {
    return (
      <PageContainer className="py-16 text-center">
        <h1 className="text-2xl font-bold text-neutral-800">DB Check</h1>
        <p className="mt-2 text-neutral-500">
          Add{" "}
          <code className="bg-neutral-100 px-1 rounded text-sm">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          to <code className="bg-neutral-100 px-1 rounded text-sm">.env.local</code>{" "}
          then restart the dev server.
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Find it: Supabase dashboard → Project Settings → API → service_role key
        </p>
      </PageContainer>
    );
  }

  let count: number | null = null;
  let errorMessage: string | null = null;

  try {
    const supabase = createAdminClient();
    const { count: c, error } = await supabase
      .from("mills")
      .select("*", { count: "exact", head: true });

    if (error) {
      errorMessage = error.message;
    } else {
      count = c;
    }
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : String(e);
  }

  if (errorMessage) {
    return (
      <PageContainer className="py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600">DB Error</h1>
        <p className="mt-2 text-neutral-600 font-mono text-sm">{errorMessage}</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-16 text-center">
      <div className="inline-flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-primary-600 inline-block" />
        <h1 className="text-2xl font-bold text-neutral-800">
          DB OK: {count} {count === 1 ? "mill" : "mills"}
        </h1>
      </div>
      <p className="mt-2 text-neutral-400 text-sm">
        Supabase connection verified · service role · RLS bypassed
      </p>
    </PageContainer>
  );
}
