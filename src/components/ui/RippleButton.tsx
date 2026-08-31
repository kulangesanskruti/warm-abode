import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export default function RippleButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  ...rest
}: Props) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
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
      setTimeout(() => ripple.remove(), 600);
    }
    onClick?.(e);
  };

  const base = variant === "primary" ? "btn-primary" : "btn-secondary";
  return (
    <button ref={btnRef} onClick={handleClick} className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}
