import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";

const faqs = [
  {
    q: "Can I manage multiple properties?",
    a: "Yes. StayHub is built for landlords with one or many properties. Add unlimited properties, each with their own rooms, beds, tenants and rent tracking — all from a single dashboard.",
  },
  {
    q: "Can I manage shared rooms?",
    a: "Absolutely. Shared rooms are a first-class concept in StayHub. You can configure rooms with multiple beds, assign tenants to individual beds, and track occupancy per bed — not just per room.",
  },
  {
    q: "Can I generate PDFs?",
    a: "Yes. StayHub generates professional PDF reports automatically — income summaries, occupancy reports and tenant lists. One click, and they are ready to share or print.",
  },
  {
    q: "Will WhatsApp reminders be supported?",
    a: "Yes. Automated WhatsApp rent reminders are a core feature. Send reminders to one tenant or all pending tenants in a single click — no manual messaging required.",
  },
  {
    q: "Is StayHub mobile friendly?",
    a: "Fully. StayHub is designed mobile-first and works beautifully on phones, tablets and desktops. Manage your PG from anywhere, anytime.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <div className="container-px">
        <SectionHeading
          eyebrow="FAQ"
          title={<>Questions, Answered</>}
          description="Everything you need to know about managing your PG with StayHub."
        />

        <div className="mx-auto mt-12 max-w-3xl space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${
                  isOpen ? "border-primary-200 shadow-card" : "border-ink-100"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                >
                  <span
                    className={`text-sm font-semibold sm:text-base ${isOpen ? "text-primary-700" : "text-ink-800"}`}
                  >
                    {f.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen ? "rotate-45 bg-primary-600 text-white" : "bg-ink-50 text-ink-500"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-500 sm:px-6 sm:pb-6">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
