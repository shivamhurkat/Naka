"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Button from "./Button";

export default function LogoutButton() {
  const t = useTranslations("nav");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className="text-sm px-3 py-1 min-h-[36px]"
    >
      {t("logout")}
    </Button>
  );
}
