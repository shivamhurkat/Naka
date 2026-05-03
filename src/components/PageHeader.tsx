import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  action?: React.ReactNode;
}

export default function PageHeader({
  title,
  backHref,
  backLabel,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center justify-center h-9 w-9 rounded-xl text-neutral-600 hover:bg-neutral-100 shrink-0"
          aria-label={backLabel}
        >
          <ChevronLeft size={20} />
        </Link>
      )}
      <h1 className="flex-1 text-xl font-bold text-neutral-800 truncate">{title}</h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
