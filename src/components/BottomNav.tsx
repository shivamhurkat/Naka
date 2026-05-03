"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
  { href: "/lots", icon: Package, labelKey: "lots" },
  { href: "/suppliers", icon: Users, labelKey: "suppliers" },
  { href: "/buyers", icon: ShoppingCart, labelKey: "buyers" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-neutral-200 safe-area-bottom">
      <div className="w-full max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, icon: Icon, labelKey }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 min-h-[56px]",
                "text-xs font-medium transition-colors",
                active
                  ? "text-primary-600"
                  : "text-neutral-500 hover:text-neutral-700",
              ].join(" ")}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
