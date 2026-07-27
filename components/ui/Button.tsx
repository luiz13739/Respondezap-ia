import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 focus:ring-brand-500/30",
  secondary:
    "border border-gray-200 bg-white text-gray-700 hover:border-brand-500 hover:text-brand-700 focus:ring-gray-200",
  ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-200",
};

/**
 * Botão base do design system do RespondeZap AI.
 * Uso: <Button variant="primary" isLoading={loading}>Entrar</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", isLoading, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
