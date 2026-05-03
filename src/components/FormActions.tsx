"use client";

interface FormActionsProps {
  children: React.ReactNode;
}

export default function FormActions({ children }: FormActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-neutral-200 px-4 py-3 safe-area-bottom">
      <div className="w-full max-w-lg mx-auto flex gap-3">{children}</div>
    </div>
  );
}
