import { motion } from "framer-motion";
import { Phone, Mail, Calendar, Home, AlertCircle, Loader2, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchTenants, formatDate, type ApiTenantListItem } from "@/lib/tenants";
import { AppLink as Link } from "@/components/ui/AppLink";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function TenantCard({ tenant }: { tenant: ApiTenantListItem }) {
  const initials = tenant.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusColor =
    tenant.status === "ACTIVE"
      ? "bg-success-100 text-success-700 border-success-200"
      : tenant.status === "VACATING"
        ? "bg-warning-100 text-warning-700 border-warning-200"
        : "bg-ink-100 text-ink-700 border-ink-200";

  return (
    <motion.div
      variants={item}
      className="rounded-xl border border-ink-200 bg-white p-6 hover:shadow-md transition-all"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {tenant.photoUrl ? (
            <img
              src={tenant.photoUrl}
              alt={tenant.fullName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold">
              {initials || <User className="h-5 w-5" />}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-ink-900">{tenant.fullName}</h3>
            <div className="mt-1 flex items-center gap-2 text-sm text-primary-600 font-medium">
              <Home className="h-4 w-4" />
              Room {tenant.room ?? "—"}
              {tenant.bed ? ` · Bed ${tenant.bed}` : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor}`}
          >
            {tenant.status}
          </span>
          <Link
            to="/tenants/$id"
            params={{ id: tenant.id }}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors"
          >
            View
          </Link>
        </div>
      </div>

      <div className="space-y-3 border-t border-ink-100 pt-4">
        <div className="flex items-center gap-3">
          <Phone className="h-4 w-4 text-ink-400" />
          <a
            href={`tel:${tenant.phone}`}
            className="text-sm text-ink-700 hover:text-primary-600 transition-colors"
          >
            {tenant.phone}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-ink-400" />
          <a
            href={`mailto:${tenant.email}`}
            className="text-sm text-ink-700 hover:text-primary-600 transition-colors"
          >
            {tenant.email}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-ink-400" />
          <span className="text-sm text-ink-700">
            Since {formatDate(tenant.moveInDate)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function PropertyTenants({ propertyId }: { propertyId?: string }) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tenants", "property", propertyId],
    queryFn: () => fetchTenants(`propertyId=${encodeURIComponent(propertyId ?? "")}`),
    enabled: !!propertyId,
  });

  const tenants = data?.tenants ?? [];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink-200 bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <span className="ml-3 text-sm font-medium text-ink-600">Loading tenants…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-danger-600" />
        <h3 className="mt-3 text-lg font-semibold text-danger-900">Failed to load tenants</h3>
        <p className="mt-2 text-sm text-danger-600">
          {error instanceof Error ? error.message : "An error occurred."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 inline-block rounded-lg bg-danger-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-danger-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-xl border border-ink-200 bg-white p-10 text-center">
        <UsersIcon className="mx-auto h-10 w-10 text-ink-400" />
        <h3 className="mt-4 text-lg font-semibold text-ink-900">No tenants found</h3>
        <p className="mt-2 text-sm text-ink-600">
          This property doesn’t have any tenants yet.
        </p>
        <Link
          to="/tenants"
          className="mt-4 inline-block rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white transition-all hover:bg-primary-700"
        >
          Add Tenant
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 lg:grid-cols-2"
    >
      {tenants.map((tenant) => (
        <TenantCard key={tenant.id} tenant={tenant} />
      ))}
    </motion.div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
