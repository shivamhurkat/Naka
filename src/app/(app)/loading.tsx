import { CardSkeleton } from "@/components/Skeleton";
import PageContainer from "@/components/PageContainer";

export default function AppLoading() {
  return (
    <PageContainer className="py-4">
      <div className="h-10 w-1/2 rounded-xl bg-neutral-200 animate-pulse mb-4" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </PageContainer>
  );
}
