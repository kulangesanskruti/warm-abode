import { inr, formatDate, tenureLabel, totalPaid, type ApiTenantDetail } from "@/lib/tenants";

interface TenantOverviewProps {
  tenant: ApiTenantDetail;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50 p-4">
      <p className="text-sm text-ink-600">{label}</p>
      <p className="mt-1 font-semibold text-ink-900 break-words">{value}</p>
    </div>
  );
}

const orDash = (value?: string | null) => (value && String(value).trim() ? String(value) : "—");

export default function TenantOverview({ tenant }: TenantOverviewProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-lg font-semibold text-ink-900">Personal Details</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full Name" value={tenant.fullName} />
          <Field label="Phone Number" value={orDash(tenant.phone)} />
          <Field label="Email" value={orDash(tenant.email)} />
          <Field label="Gender" value={orDash(tenant.gender)} />
          <Field label="Occupation" value={orDash(tenant.occupation)} />
          <Field label="Permanent Address" value={orDash(tenant.permanentAddress)} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-ink-900">Current Property</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Property" value={orDash(tenant.property)} />
          <Field label="Room" value={orDash(tenant.room)} />
          <Field label="Bed" value={orDash(tenant.bed)} />
          <Field label="Move-in Date" value={formatDate(tenant.moveInDate)} />
          <Field label="Expected Vacating" value={formatDate(tenant.expectedVacateDate)} />
          <Field label="Duration" value={tenureLabel(tenant.moveInDate)} />
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-ink-900">Rental Details</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-4">
            <p className="text-sm text-primary-600">Monthly Rent</p>
            <p className="mt-1 text-2xl font-bold text-primary-900">{inr(tenant.monthlyRent)}</p>
          </div>
          <div className="rounded-lg border-2 border-warning-200 bg-warning-50 p-4">
            <p className="text-sm text-warning-600">Security Deposit</p>
            <p className="mt-1 text-2xl font-bold text-warning-900">
              {inr(tenant.securityDeposit)}
            </p>
          </div>
          <div className="rounded-lg border-2 border-success-200 bg-success-50 p-4">
            <p className="text-sm text-success-600">Total Paid</p>
            <p className="mt-1 text-2xl font-bold text-success-900">
              {inr(totalPaid(tenant.payments))}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold text-ink-900">Emergency Contact</h3>
        <div className="rounded-lg border border-ink-100 bg-ink-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-ink-600">Name</p>
              <p className="mt-1 font-semibold text-ink-900">{orDash(tenant.emergencyContact)}</p>
            </div>
            <div>
              <p className="text-sm text-ink-600">Phone</p>
              <p className="mt-1 font-semibold text-ink-900">{orDash(tenant.emergencyPhone)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
