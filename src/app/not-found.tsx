import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";

export default function NotFound() {
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-screen text-center gap-6">
      <div>
        <p className="text-6xl font-bold text-primary-700">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-800">
          Page not found
        </h1>
        <p className="mt-2 text-neutral-500">
          This page does not exist or has been moved.
        </p>
      </div>
      <Link href="/">
        <Button variant="primary">Go back home</Button>
      </Link>
    </PageContainer>
  );
}
