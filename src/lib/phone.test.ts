import { normalizeIndianPhone } from "./phone.js";

let passed = 0;
let failed = 0;

function check(label: string, got: unknown, expected: unknown) {
  const match = JSON.stringify(got) === JSON.stringify(expected);
  if (match) {
    console.log(`  PASS  ${label}`);
    passed++;
  } else {
    console.error(`  FAIL  ${label}`);
    console.error(`        expected: ${JSON.stringify(expected)}`);
    console.error(`        got:      ${JSON.stringify(got)}`);
    failed++;
  }
}

// Valid inputs
check("plain 10 digits",
  normalizeIndianPhone("9876543210"),
  { ok: true, e164: "+919876543210", national: "9876543210" }
);

check("leading 0 (11 digits)",
  normalizeIndianPhone("09876543210"),
  { ok: true, e164: "+919876543210", national: "9876543210" }
);

check("+91 prefix (12 digits)",
  normalizeIndianPhone("+919876543210"),
  { ok: true, e164: "+919876543210", national: "9876543210" }
);

check("91 prefix with space",
  normalizeIndianPhone("91 9876543210"),
  { ok: true, e164: "+919876543210", national: "9876543210" }
);

check("+91 with dashes",
  normalizeIndianPhone("+91-98765-43210"),
  { ok: true, e164: "+919876543210", national: "9876543210" }
);

// Leading 6, 7, 8
check("starts with 6",
  normalizeIndianPhone("6876543210"),
  { ok: true, e164: "+916876543210", national: "6876543210" }
);

// Invalid inputs
check("too short",
  normalizeIndianPhone("12345"),
  { ok: false, reason: "too_short" }
);

check("invalid prefix (starts with 5)",
  normalizeIndianPhone("5876543210"),
  { ok: false, reason: "invalid_prefix" }
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
