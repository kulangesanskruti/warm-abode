import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/ui/AppLink";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import RippleButton from "@/components/ui/RippleButton";

const links = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing", badge: "Soon" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={`transition-all duration-300 ${
          scrolled
            ? "border-b border-ink-100 bg-white/85 backdrop-blur-xl shadow-soft"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav className="container-px flex h-16 items-center justify-between sm:h-[4.5rem]">
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="group relative rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
              >
                {l.label}
                {l.badge && (
                  <span className="ml-1.5 rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-600">
                    {l.badge}
                  </span>
                )}
                <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary-500 transition-transform duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600"
            >
              Login
            </Link>
            <Link to="/register">
              <RippleButton className="px-5 py-2.5">Get Started</RippleButton>
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-700 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-4 mt-2 overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-card md:hidden"
          >
            <div className="flex flex-col p-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50"
                >
                  {l.label}
                  {l.badge && (
                    <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-bold uppercase text-primary-600">
                      {l.badge}
                    </span>
                  )}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-ink-100 pt-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-ink-50"
                >
                  Login
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <RippleButton className="w-full">Get Started</RippleButton>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
