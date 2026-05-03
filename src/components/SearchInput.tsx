"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  debounceMs = 300,
}: SearchInputProps) {
  const t = useTranslations("common");
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setLocal(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(next), debounceMs);
  }

  function clear() {
    setLocal("");
    onChange("");
  }

  return (
    <div className="relative flex items-center">
      <Search
        className="absolute left-3 text-neutral-400 pointer-events-none"
        size={16}
      />
      <input
        type="search"
        value={local}
        onChange={handleChange}
        placeholder={t("search")}
        className="h-10 w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-9 text-base text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
      {local && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-3 text-neutral-400"
          aria-label={t("close")}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
