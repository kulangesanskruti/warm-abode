import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MailCheck, ArrowLeft } from "lucide-react";
import { AppLink as Link } from "@/components/ui/AppLink";
import AuthLayout from "@/components/auth/AuthLayout";
import { Input } from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1400);
  };

  return (
    <AuthLayout
      title={sent ? "Check your email" : "Forgot password?"}
      subtitle={
        sent
          ? `We sent a reset link to ${email || "your email"}.`
          : "No worries — enter your email and we'll send you a reset link."
      }
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col items-center rounded-2xl border border-ink-100 bg-white p-8 text-center shadow-card">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600">
              <MailCheck className="h-8 w-8" />
            </span>
            <h3 className="mt-5 text-lg font-bold text-ink-900">Email sent</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Check your inbox for a link to reset your password. If you don't see it within a few
              minutes, check your spam folder.
            </p>
          </div>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4.5 w-4.5" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthButton type="submit" loading={loading}>
            {loading ? "Sending link..." : "Send Reset Link"}
          </AuthButton>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 pt-2 text-sm font-semibold text-ink-500 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}
