"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ChevronDown, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  required,
  hint,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleSelect = useCallback(
    (opt: SelectOption) => {
      onChange(opt.value);
      setOpen(false);
      setSearch("");
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange("");
      setSearch("");
    },
    [onChange]
  );

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
        {label}
        {!required && hint && (
          <span className="ml-1 text-xs text-neutral-400 font-normal">{hint}</span>
        )}
      </label>

      {/* Trigger */}
      <button
        id={inputId}
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "h-11 rounded-xl border px-3 text-base text-left flex items-center justify-between gap-2",
          "bg-white outline-none focus:ring-2 focus:ring-primary-100",
          error
            ? "border-red-400 focus:border-red-400"
            : "border-neutral-300 focus:border-primary-500",
        ].join(" ")}
      >
        <span className={selected ? "text-neutral-900" : "text-neutral-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {selected && (
            <span
              role="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 p-0.5"
            >
              <X size={14} />
            </span>
          )}
          <ChevronDown size={16} className="text-neutral-400" />
        </span>
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Overlay/Dropdown */}
      {open && (
        <>
          {/* Mobile: fullscreen overlay */}
          <div className="fixed inset-0 z-50 flex flex-col bg-white sm:hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-200">
              <Search size={16} className="text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-base outline-none text-neutral-900 placeholder:text-neutral-400"
              />
              <button
                type="button"
                onClick={() => { setOpen(false); setSearch(""); }}
                className="text-neutral-500 text-sm font-medium ml-2"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-400 text-sm py-8">—</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={[
                      "w-full text-left px-4 py-3 text-base border-b border-neutral-100",
                      "hover:bg-primary-50 active:bg-primary-100",
                      opt.value === value ? "text-primary-700 font-semibold" : "text-neutral-900",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Desktop: dropdown */}
          <div className="hidden sm:block absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-neutral-100">
              <Search size={14} className="text-neutral-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-sm outline-none text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="text-center text-neutral-400 text-sm py-4">—</p>
              ) : (
                filtered.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={[
                      "w-full text-left px-3 py-2.5 text-sm",
                      "hover:bg-primary-50 active:bg-primary-100",
                      opt.value === value ? "text-primary-700 font-semibold" : "text-neutral-900",
                    ].join(" ")}
                  >
                    {opt.label}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
