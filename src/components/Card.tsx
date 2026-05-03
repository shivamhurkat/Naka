interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  const base =
    "rounded-2xl border border-neutral-200 bg-white p-4 " + className;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={base + " w-full text-left active:bg-neutral-50"}
      >
        {children}
      </button>
    );
  }

  return <div className={base}>{children}</div>;
}
