import { motion } from "framer-motion";

const ROLES = [
  { id: "owner", name: "Owner", description: "Full access to all features" },
  { id: "manager", name: "Manager", description: "Can manage properties, rooms, and tenants" },
  { id: "accountant", name: "Accountant", description: "Can view and manage financial records" },
  { id: "viewer", name: "Viewer", description: "Can only view data, no editing permissions" },
];

const PERMISSIONS = [
  "View Dashboard",
  "Manage Properties",
  "Manage Rooms",
  "Manage Tenants",
  "Collect Rent",
  "View Reports",
  "WhatsApp Access",
  "Settings Access",
  "User Management",
  "Backup & Export",
];

export default function UsersPermissions() {
  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Users & Permissions</h1>
        <p className="mt-2 text-ink-600">Manage user roles and permissions</p>
      </div>

      {/* Permission Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-ink-900 w-48">
                  Permission
                </th>
                {ROLES.map((role) => (
                  <th
                    key={role.id}
                    className="px-6 py-4 text-center text-sm font-semibold text-ink-900 w-32"
                  >
                    <div className="font-bold text-primary-700">{role.name}</div>
                    <div className="text-xs text-ink-600 font-normal mt-1">{role.description}</div>
                  </th>
                ))}
              </tr>
            </thead>
            {/* Body */}
            <tbody>
              {PERMISSIONS.map((permission, idx) => (
                <tr
                  key={permission}
                  className={`border-b border-ink-100 ${idx % 2 === 0 ? "bg-white" : "bg-ink-50"}`}
                >
                  <td className="px-6 py-4 text-sm font-medium text-ink-900">{permission}</td>
                  {ROLES.map((role) => {
                    // Permission logic
                    const hasPermission =
                      role.id === "owner" ||
                      (role.id === "manager" &&
                        !["Settings Access", "User Management", "Backup & Export"].includes(
                          permission,
                        )) ||
                      (role.id === "accountant" &&
                        ["View Dashboard", "View Reports", "Collect Rent"].includes(permission)) ||
                      (role.id === "viewer" &&
                        ["View Dashboard", "View Reports"].includes(permission));

                    return (
                      <td key={`${role.id}-${permission}`} className="px-6 py-4 text-center">
                        <motion.div
                          animate={{
                            scale: hasPermission ? 1 : 0.8,
                          }}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded ${
                            hasPermission ? "bg-success-100" : "bg-ink-100"
                          }`}
                        >
                          {hasPermission ? (
                            <svg
                              className="h-3 w-3 text-success-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="h-3 w-3 text-ink-300"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </motion.div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-primary-200 bg-primary-50 p-6"
      >
        <p className="text-sm text-primary-900">
          <span className="font-semibold">Note:</span> Role permissions can be customized by
          creating custom roles. Contact your administrator to create additional roles.
        </p>
      </motion.div>

      {/* Current Users */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-ink-900">Current Users</h3>
          <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
            Invite User
          </button>
        </div>

        <div className="space-y-3">
          {[
            {
              name: "Prashant Singh",
              email: "prashant@stayhub.com",
              role: "Owner",
              status: "Active",
            },
            { name: "Ravi Kumar", email: "ravi@stayhub.com", role: "Manager", status: "Active" },
            {
              name: "Deepak Sharma",
              email: "deepak@stayhub.com",
              role: "Accountant",
              status: "Active",
            },
          ].map((user) => (
            <div
              key={user.email}
              className="flex items-center justify-between rounded-lg border border-ink-200 p-4 hover:bg-ink-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">{user.name}</p>
                <p className="text-xs text-ink-600 mt-1">{user.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-medium text-ink-700">{user.role}</p>
                  <p
                    className={`text-xs ${user.status === "Active" ? "text-success-600" : "text-ink-500"}`}
                  >
                    {user.status}
                  </p>
                </div>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
