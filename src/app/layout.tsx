import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

// Loaded for Hindi locale — covers Devanagari + Latin glyphs.
// Applied as a CSS variable; Tailwind falls back to system-ui when the
// variable is absent (English locale).
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naka — Mill gate logbook",
  description:
    "Har truck ka photo record. Har lot ka hisab. Phone-first logbook for cotton, oil & dal mills.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    // Apply Devanagari font variable only when locale is Hindi;
    // English falls back to system-ui via Tailwind fontFamily config.
    <html
      lang={locale}
      className={locale === "hi" ? notoDevanagari.variable : ""}
    >
      <body className="antialiased">
        <NextTopLoader color="#15803d" height={3} showSpinner={false} />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
