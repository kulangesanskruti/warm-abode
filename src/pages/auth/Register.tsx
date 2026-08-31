import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Mail, User, Phone } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import { AuthLink } from "@/components/auth/GoogleButton";
import { Input, PasswordInput } from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";
import Checkbox from "@/components/ui/AuthCheckbox";
import { register } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) return;
    setErrors({});
    setFormError("");

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const user = await register({ fullName, email, phone, password });
      await navigate({ to: user.profileComplete ? "/dashboard" : "/profile-setup" });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fieldErrors);
        setFormError(Object.keys(err.fieldErrors).length ? "" : err.message);
      } else {
        setFormError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your PG business smarter in just a few minutes."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Prashant Sharma"
          icon={<User className="h-4.5 w-4.5" />}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors["fullName"]}
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4.5 w-4.5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors["email"]}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="+91 98765 43210"
          icon={<Phone className="h-4.5 w-4.5" />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors["phone"]}
        />
        <PasswordInput
          label="Password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors["password"]}
        />
        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors["confirmPassword"]}
        />

        {formError && (
          <p className="text-sm font-medium text-danger-600" role="alert">
            {formError}
          </p>
        )}

        <div className="pt-1">
          <Checkbox
            id="terms"
            checked={agree}
            onChange={setAgree}
            label={
              <>
                I agree to the <span className="font-semibold text-primary-600">Terms</span> &{" "}
                <span className="font-semibold text-primary-600">Privacy Policy</span>
              </>
            }
          />
        </div>

        <div className="pt-2">
          <AuthButton type="submit" loading={loading} disabled={!agree}>
            {loading ? "Creating account..." : "Create Account"}
          </AuthButton>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account? <AuthLink to="/login">Sign In</AuthLink>
        </p>
      </form>
    </AuthLayout>
  );
}
