import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Naka — Mill gate logbook",
  description:
    "Har truck ka photo record. Har lot ka hisab. Phone-first logbook for cotton, oil & dal mills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi">
      <body className="antialiased">{children}</body>
    </html>
  );
}
