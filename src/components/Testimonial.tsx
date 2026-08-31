import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

export default function Testimonial() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-px">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-ink-100 bg-white p-8 text-center shadow-card sm:p-12"
        >
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-success-100/50 blur-3xl" />

          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <Quote className="h-6 w-6" />
          </span>

          <div className="mt-5 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4.5 w-4.5 fill-warning-500 text-warning-500" />
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-xl font-medium leading-relaxed text-ink-800 sm:text-2xl sm:leading-relaxed">
            "StayHub made managing my tenants and rent collection much easier than maintaining
            registers."
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-base font-bold text-white">
              P
            </span>
            <div className="text-left">
              <p className="text-sm font-bold text-ink-900">Prashant S.</p>
              <p className="text-xs text-ink-500">PG Owner</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
