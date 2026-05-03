// Locale-aware Zod error messages.
// Usage: z.setErrorMap(getZodErrorMap(locale))

import { z } from "zod";

type Locale = "hi" | "en";

const MESSAGES: Record<Locale, Record<string, string>> = {
  hi: {
    required: "यह फ़ील्ड ज़रूरी है",
    invalid_type: "अमान्य मान",
    too_small: "मान बहुत छोटा है",
    too_big: "मान बहुत बड़ा है",
    invalid_string: "अमान्य फॉर्मेट",
  },
  en: {
    required: "This field is required",
    invalid_type: "Invalid value",
    too_small: "Value is too small",
    too_big: "Value is too large",
    invalid_string: "Invalid format",
  },
};

export function getZodErrorMap(locale: Locale): z.ZodErrorMap {
  const msgs = MESSAGES[locale];
  return (issue) => {
    const message =
      msgs[issue.code] ?? msgs["invalid_type"] ?? "Invalid value";
    return { message };
  };
}
