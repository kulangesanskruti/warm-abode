import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode | undefined;
  error?: string | undefined;
  success?: boolean | undefined;
  hint?: string | undefined;
};

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, icon, error, success, hint, className = "", type = "text", id, ...rest }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-700">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 placeholder-ink-400 transition-all duration-200 ${
              icon ? "pl-11" : ""
            } ${
              error
                ? "border-danger-300 focus:border-danger-500 focus:ring-4 focus:ring-danger-500/10"
                : success
                  ? "border-success-300 focus:border-success-500 focus:ring-4 focus:ring-success-500/10"
                  : "border-ink-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            } focus:outline-none ${className}`}
            {...rest}
          />
          {error && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-danger-500">
              <AlertCircle className="h-4.5 w-4.5" />
            </span>
          )}
          {success && !error && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success-500">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger-600">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        ) : hint ? (
          <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

export function PasswordInput({ label, error, id, ...rest }: Props) {
  const [show, setShow] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-ink-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={show ? "text" : "password"}
          className={`w-full rounded-xl border bg-white px-4 py-3 pr-11 text-sm text-ink-900 placeholder-ink-400 transition-all duration-200 ${
            error
              ? "border-danger-300 focus:border-danger-500 focus:ring-4 focus:ring-danger-500/10"
              : "border-ink-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
          } focus:outline-none`}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition-colors hover:text-ink-600"
          tabIndex={-1}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger-600">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
