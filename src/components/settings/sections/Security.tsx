import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Lock, Smartphone, LogOut } from "lucide-react";

export default function Security() {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSavePassword = () => {
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowPasswordForm(false);
    }, 2000);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink-900">Security</h1>
        <p className="mt-2 text-ink-600">Manage your account security and sessions</p>
      </div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="h-5 w-5 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-ink-900">Change Password</h3>
              <p className="text-xs text-ink-600 mt-1">Last changed 3 months ago</p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showPasswordForm ? "Cancel" : "Change"}
          </button>
        </div>

        {showPasswordForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 border-t border-ink-200 pt-4 mt-4"
          >
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full rounded-lg border border-ink-200 px-4 py-2.5 text-ink-900 placeholder-ink-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>

            <button
              onClick={handleSavePassword}
              className={`w-full flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-all ${
                saveSuccess
                  ? "bg-success-600 hover:bg-success-700"
                  : "bg-primary-600 hover:bg-primary-700"
              }`}
            >
              {saveSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Password Updated
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Two-Factor Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-primary-600" />
            <div>
              <h3 className="text-lg font-semibold text-ink-900">Two-Factor Authentication</h3>
              <p className="text-xs text-ink-600 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={false}
              className="h-5 w-5 rounded border-ink-300 text-primary-600"
            />
          </label>
        </div>
        <p className="text-xs text-ink-600 border-t border-ink-200 pt-4">
          When enabled, you&apos;ll need to enter a code from your authenticator app each time you
          log in.
        </p>
      </motion.div>

      {/* Active Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Active Sessions</h3>
        <div className="space-y-3">
          {[
            {
              device: "Chrome on MacOS",
              location: "Delhi, India",
              lastActive: "Now",
              current: true,
            },
            {
              device: "Safari on iOS",
              location: "New Delhi, India",
              lastActive: "2 hours ago",
              current: false,
            },
            {
              device: "Chrome on Windows",
              location: "Mumbai, India",
              lastActive: "1 day ago",
              current: false,
            },
          ].map((session, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-ink-200 p-4 hover:bg-ink-50 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-ink-900">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 inline-block px-2 py-1 rounded text-xs bg-success-100 text-success-700 font-medium">
                      Current
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-600 mt-1">{session.location}</p>
                <p className="text-xs text-ink-500 mt-0.5">Last active: {session.lastActive}</p>
              </div>
              {!session.current && (
                <button className="flex items-center gap-2 text-danger-600 hover:text-danger-700 text-sm font-medium">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Logins */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-ink-200 bg-white p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-ink-900">Recent Logins</h3>
        <div className="space-y-3">
          {[
            { time: "Today at 10:30 AM", device: "Chrome on MacOS", location: "Delhi, India" },
            { time: "Yesterday at 5:15 PM", device: "Safari on iOS", location: "New Delhi, India" },
            {
              time: "2 days ago at 3:45 PM",
              device: "Chrome on Windows",
              location: "Mumbai, India",
            },
          ].map((login, idx) => (
            <div key={idx} className="flex items-start justify-between rounded-lg bg-ink-50 p-3">
              <div>
                <p className="text-xs font-medium text-ink-900">{login.time}</p>
                <p className="text-xs text-ink-600 mt-1">{login.device}</p>
                <p className="text-xs text-ink-500">{login.location}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sign Out Everywhere */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border border-danger-200 bg-danger-50 p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-danger-900">Sign Out Everywhere</h3>
            <p className="text-xs text-danger-700 mt-1">Sign out from all devices and sessions</p>
          </div>
          <button className="rounded-lg border border-danger-300 bg-white px-4 py-2 text-sm font-medium text-danger-700 hover:bg-danger-50 transition-colors">
            Sign Out All
          </button>
        </div>
      </motion.div>
    </div>
  );
}
