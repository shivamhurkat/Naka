import PageContainer from "@/components/PageContainer";
import { Skeleton } from "@/components/Skeleton";

export default function DashboardLoading() {
  return (
    <PageContainer className="py-8 flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
    </PageContainer>
  );
}
