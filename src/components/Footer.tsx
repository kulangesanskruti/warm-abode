import { Building2, Twitter, Linkedin, Instagram, Github } from "lucide-react";
import Logo from "@/components/ui/Logo";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

const socials = [Twitter, Linkedin, Instagram, Github];

export default function Footer() {
  return (
    <footer className="relative border-t border-ink-100 bg-white">
      <div className="container-px py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              The all-in-one platform for PG owners and landlords. Manage rooms, beds, tenants, rent
              and reports — beautifully.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-100 text-ink-500 transition-all duration-300 hover:border-primary-200 hover:bg-primary-50 hover:text-primary-600"
                  aria-label="social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-ink-900">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-ink-500 transition-colors hover:text-primary-600"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-sm font-bold text-ink-900">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-500">
              <li>hello@stayhub.com</li>
              <li>+91 98765 43210</li>
              <li>Bengaluru, India</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-ink-100 pt-6 sm:flex-row">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} StayHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <Building2 className="h-3.5 w-3.5" />
            Built for landlords, by people who get it.
          </div>
        </div>
      </div>
    </footer>
  );
}
