/**
 * Seeds 3 demo users on the DEMO01 mill.
 * Run from project root:  npx tsx scripts/seed-users.ts
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_MILL_CODE = "DEMO01";
const DEMO_PIN = "1234";

const DEMO_USERS = [
  { name: "Demo Owner",   phone: "9000000001", role: "owner"   as const },
  { name: "Demo Manager", phone: "9000000002", role: "manager" as const },
  { name: "Demo Munim",   phone: "9000000003", role: "munim"   as const },
];

async function main() {
  console.log("Fetching demo mill…");
  const { data: mill, error: millErr } = await supabase
    .from("mills")
    .select("id, name")
    .eq("code", DEMO_MILL_CODE)
    .single();

  if (millErr || !mill) {
    console.error(
      "Demo mill not found. Run supabase/seed.sql first.\n",
      millErr?.message ?? ""
    );
    process.exit(1);
  }

  console.log(`Mill: ${mill.name} (${mill.id})`);
  console.log("Hashing PIN…");
  const pin_hash = await bcrypt.hash(DEMO_PIN, 10);

  for (const u of DEMO_USERS) {
    const { error } = await supabase.from("users").upsert(
      {
        mill_id: mill.id,
        name: u.name,
        phone: u.phone,
        pin_hash,
        role: u.role,
        is_active: true,
      },
      { onConflict: "mill_id,phone" }
    );

    if (error) {
      console.error(`  ✗ ${u.name}: ${error.message}`);
    } else {
      console.log(`  ✓ ${u.name} (${u.role}) — phone ${u.phone} PIN ${DEMO_PIN}`);
    }
  }

  console.log("\nDone. Test logins:");
  console.log("  Mill code : DEMO01");
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(7)} : ${u.phone}  PIN 1234`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
