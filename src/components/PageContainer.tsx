interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Remove horizontal padding (e.g. for full-bleed sections) */
  noPadding?: boolean;
}

export default function PageContainer({
  children,
  className = "",
  noPadding = false,
}: PageContainerProps) {
  return (
    <div
      className={[
        "w-full mx-auto max-w-lg",
        noPadding ? "" : "px-4 py-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
