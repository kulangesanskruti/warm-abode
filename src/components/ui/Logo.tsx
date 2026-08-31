type Props = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

export default function Logo({ className = "", size = "md" }: Props) {
  const imgSize = size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-9 w-9";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";

  return (
    <a href="#top" className={`group inline-flex items-center gap-2.5 outline-none ${className}`}>
      <img
        src="/image.png"
        alt="StayHub logo"
        className={`${imgSize} shrink-0 object-contain transition-transform duration-300 group-hover:scale-105`}
        draggable={false}
      />
      <span className={`${textSize} font-bold tracking-tight text-ink-900`}>
        Stay<span className="text-primary-600">Hub</span>
      </span>
    </a>
  );
}
