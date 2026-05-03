"use client";

import { forwardRef } from "react";

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
          {!props.required && (
            <span className="ml-1 text-xs text-neutral-400 font-normal">{hint}</span>
          )}
        </label>
        <input
          ref={ref}
          id={inputId}
          {...props}
          className={[
            "h-11 rounded-xl border px-3 text-base text-neutral-900",
            "placeholder:text-neutral-400 bg-white outline-none",
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

TextField.displayName = "TextField";
export default TextField;
