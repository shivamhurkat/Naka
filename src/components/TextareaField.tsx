"use client";

import { forwardRef } from "react";

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
          {hint && (
            <span className="ml-1 text-xs text-neutral-400 font-normal">{hint}</span>
          )}
        </label>
        <textarea
          ref={ref}
          id={inputId}
          rows={3}
          {...props}
          className={[
            "rounded-xl border px-3 py-2.5 text-base text-neutral-900",
            "placeholder:text-neutral-400 bg-white outline-none resize-none",
            "focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
            "disabled:bg-neutral-50 disabled:text-neutral-500",
            error
              ? "border-red-400 focus:border-red-400 focus:ring-red-100"
              : "border-neutral-300",
            props.className ?? "",
          ]
            .join(" ")
            .trim()}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);

TextareaField.displayName = "TextareaField";
export default TextareaField;
