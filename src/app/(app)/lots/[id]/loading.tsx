import PageContainer from "@/components/PageContainer";
import { Skeleton } from "@/components/Skeleton";

export default function LotDetailLoading() {
  return (
    <PageContainer className="py-4">
      <Skeleton className="h-8 w-40 mb-4" />
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 flex flex-col gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
