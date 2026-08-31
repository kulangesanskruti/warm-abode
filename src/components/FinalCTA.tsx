import { motion } from "framer-motion";
import { AppLink as Link } from "@/components/ui/AppLink";
import { ArrowRight } from "lucide-react";
import RippleButton from "@/components/ui/RippleButton";

export default function FinalCTA() {
  return (
    <section id="pricing" className="relative py-20 sm:py-28">
      <div className="container-px">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 px-6 py-16 text-center shadow-glow sm:px-12 sm:py-20"
        >
          {/* decorative */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-success-400/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
                backgroundSize: "28px 28px",
              }}
            />
          </div>

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-success-400" />
              No credit card required
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.1]">
              Ready to Simplify Your PG Management?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-primary-100 sm:text-lg">
              Join landlords who replaced registers and spreadsheets with one beautiful platform.
            </p>
            <div className="mt-8 flex justify-center">
              <Link to="/register">
                <RippleButton className="bg-white px-8 py-4 text-base text-primary-700 hover:bg-primary-50">
                  Start Free
                  <ArrowRight className="h-4 w-4" />
                </RippleButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
