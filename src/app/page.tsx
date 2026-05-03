import Link from "next/link";
import PageContainer from "@/components/PageContainer";
import Button from "@/components/Button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <PageContainer className="flex flex-col items-center text-center gap-6 py-16">
          {/* Wordmark */}
          <div>
            <h1 className="text-6xl font-extrabold tracking-tight text-primary-700">
              Naka
            </h1>
            <p className="mt-2 text-xl font-semibold text-neutral-700">
              Mill gate logbook
            </p>
            <p className="mt-3 text-base text-neutral-500 leading-relaxed">
              Har truck ka photo record.{" "}
              <span className="whitespace-nowrap">Har lot ka hisab.</span>
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3 w-full mt-2">
            <Link href="/login" className="w-full min-h-0">
              <Button variant="primary" fullWidth>
                Open Logbook
              </Button>
            </Link>
            <Link
              href="/owners"
              className="inline-flex items-center justify-center min-h-[44px] text-primary-700 font-medium underline underline-offset-4 hover:text-primary-800 transition-colors"
            >
              For mill owners
            </Link>
          </div>
        </PageContainer>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-sm text-neutral-400">
          Made for cotton, oil &amp; dal mills
        </p>
      </footer>
    </div>
  );
}
