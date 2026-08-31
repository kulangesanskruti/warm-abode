import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppLink as Link } from "@/components/ui/AppLink";
import { Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import Divider from "@/components/auth/Divider";
import GoogleButton, { AuthLink } from "@/components/auth/GoogleButton";
import { Input, PasswordInput } from "@/components/ui/AuthInput";
import AuthButton from "@/components/ui/AuthButton";
import Checkbox from "@/components/ui/AuthCheckbox";
import { login } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setFormError("");
    try {
      const user = await login(email, password);
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
      title="Welcome back"
      subtitle="Sign in to manage your properties, tenants and rent."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4.5 w-4.5" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors["email"]}
        />
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors["password"]}
        />

        {formError && (
          <p className="text-sm font-medium text-danger-600" role="alert">
            {formError}
          </p>
        )}

        <div className="flex items-center justify-between">
          <Checkbox id="remember" checked={remember} onChange={setRemember} label="Remember me" />
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton type="submit" loading={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </AuthButton>

        <Divider>or</Divider>

        <GoogleButton />

        <p className="mt-8 text-center text-sm text-ink-500">
          Don't have an account? <AuthLink to="/register">Create Account</AuthLink>
        </p>
      </form>
    </AuthLayout>
  );
}
