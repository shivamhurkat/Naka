type PhoneOk = { ok: true; e164: string; national: string };
type PhoneFail = { ok: false; reason: "too_short" | "too_long" | "invalid_prefix" };

export type PhoneResult = PhoneOk | PhoneFail;

export function normalizeIndianPhone(input: string): PhoneResult {
  // 1. Strip everything except digits and leading +
  let s = input.replace(/[^\d+]/g, "");

  // 2. If starts with "+91", strip "+91"
  if (s.startsWith("+91")) {
    s = s.slice(3);
  }
  // 3. If starts with "91" and total length is 12, strip "91"
  else if (s.startsWith("91") && s.length === 12) {
    s = s.slice(2);
  }
  // 4. If starts with "0" and total length is 11, strip "0"
  else if (s.startsWith("0") && s.length === 11) {
    s = s.slice(1);
  }

  // 5. Validate 10 digits, first digit in [6-9]
  if (s.length < 10) return { ok: false, reason: "too_short" };
  if (s.length > 10) return { ok: false, reason: "too_long" };
  if (!/^[6-9]/.test(s)) return { ok: false, reason: "invalid_prefix" };

  return { ok: true, e164: "+91" + s, national: s };
}
