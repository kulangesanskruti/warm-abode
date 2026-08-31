import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock, Check, ArrowLeft } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { PasswordInput } from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";

const rules = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
];

export default function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => navigate({ to: "/login" }), 2000);
    }, 1500);
  };

  if (success) {
    return (
      <AuthLayout
        title="Password reset successful"
        subtitle="Your password has been reset. Redirecting to login..."
      >
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success-50 text-success-600">
              <Check className="h-8 w-8" />
            </div>
          </div>
          <p className="text-sm text-ink-600">You will be redirected in a moment.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password to secure your StayHub account."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <PasswordInput
          label="New Password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* password strength */}
        {password.length > 0 && (
          <div className="space-y-2 rounded-xl border border-ink-100 bg-ink-50/60 p-3.5">
            {rules.map((r) => {
              const passed = r.test(password);
              return (
                <div
                  key={r.label}
                  className={`flex items-center gap-2 text-xs transition-colors ${
                    passed ? "text-success-600" : "text-ink-400"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${
                      passed ? "bg-success-500 text-white" : "bg-ink-200 text-ink-400"
                    }`}
                  >
                    {passed && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  {r.label}
                </div>
              );
            })}
          </div>
        )}

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm.length > 0 && password !== confirm ? "Passwords do not match" : undefined}
        />

        <AuthButton type="submit" loading={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </AuthButton>

        <button
          type="button"
          onClick={() => navigate({ to: "/login" })}
          className="flex items-center justify-center gap-2 w-full pt-2 text-sm font-semibold text-ink-500 transition-colors hover:text-primary-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>
      </form>
    </AuthLayout>
  );
}
