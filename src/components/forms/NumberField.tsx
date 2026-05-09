"use client";

import { useState, forwardRef } from "react";

interface NumberFieldProps {
  label: string;
  value: string;
  onChange: (raw: string) => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: string;
}

const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  ({ label, value, onChange, placeholder, prefix, suffix, error, hint, required, min, max, step = "any" }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = label.toLowerCase().replace(/[\s/()]+/g, "-");

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value;
      // Allow digits, one dot, minus at start
      if (/^-?\d*\.?\d*$/.test(raw) || raw === "") {
        onChange(raw);
      }
    }

    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
          {!required && hint && (
            <span className="ml-1 text-xs text-neutral-400 font-normal">{hint}</span>
          )}
        </label>
        <div
          className={[
            "h-11 rounded-xl border flex items-center overflow-hidden bg-white",
            "focus-within:ring-2 focus-within:ring-primary-100",
            error
              ? "border-red-400 focus-within:border-red-400"
              : focused
              ? "border-primary-500"
              : "border-neutral-300",
          ].join(" ")}
        >
          {prefix && (
            <span className="px-3 text-neutral-500 text-base select-none shrink-0">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            required={required}
            min={min}
            max={max}
            step={step}
            className="flex-1 min-w-0 h-full px-3 text-base text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
            style={{ paddingLeft: prefix ? 0 : undefined, paddingRight: suffix ? 0 : undefined }}
          />
          {suffix && (
            <span className="px-3 text-neutral-500 text-sm select-none shrink-0">{suffix}</span>
          )}
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

NumberField.displayName = "NumberField";
export default NumberField;
