interface EmptyStateProps {
  message: string;
  hint?: string;
  icon?: React.ReactNode;
}

export default function EmptyState({ message, hint, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-neutral-500">
      {icon && <div className="mb-2 text-neutral-300">{icon}</div>}
      <p className="font-medium">{message}</p>
      {hint && <p className="text-sm text-neutral-400">{hint}</p>}
    </div>
  );
}
