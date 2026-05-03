import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const VALID_LOCALES = ["hi", "en"] as const;
type Locale = (typeof VALID_LOCALES)[number];

function resolveLocale(raw: string | undefined): Locale {
  return VALID_LOCALES.includes(raw as Locale) ? (raw as Locale) : "hi";
}

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const locale = resolveLocale(cookieStore.get("naka_locale")?.value);

  const messages =
    locale === "en"
      ? (await import("./messages/en.json")).default
      : (await import("./messages/hi.json")).default;

  return { locale, messages };
});
