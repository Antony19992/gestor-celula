import { ButtonHTMLAttributes, ReactNode } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "success";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:bg-blue-300",
  secondary:
    "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm disabled:opacity-50 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:bg-red-300",
  ghost: "hover:bg-gray-100 text-gray-700 disabled:opacity-50 dark:hover:bg-gray-800 dark:text-gray-300",
  success:
    "bg-green-600 hover:bg-green-700 text-white shadow-sm disabled:bg-green-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
