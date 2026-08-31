import { useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  loading?: boolean;
  className?: string;
};

export default function AuthButton({
  children,
  loading = false,
  className = "",
  onClick,
  disabled,
  ...rest
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [rippling, setRippling] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    const btn = btnRef.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);
      setRippling(true);
      setTimeout(() => {
        ripple.remove();
        setRippling(false);
      }, 600);
    }
    onClick?.(e);
  };

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={loading || disabled}
      className={`relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-all duration-300 hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
