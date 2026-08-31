import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { AppLink as Link } from "@/components/ui/AppLink";
import { clearSession } from "@/lib/api";
import { useCurrentUser, getInitials } from "@/lib/profile";
import {
  Hop as Home,
  Building2,
  BedDouble,
  Users,
  Wallet,
  FileText,
  MessageCircle,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const navItems = [
  { icon: Home, label: "Control Center", href: "/dashboard" },
  { icon: Building2, label: "Properties", href: "/properties" },
  { icon: BedDouble, label: "Rooms", href: "/rooms" },
  { icon: Users, label: "Tenants", href: "/tenants" },
  { icon: Wallet, label: "Rent", href: "/rent" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: MessageCircle, label: "WhatsApp", href: "/whatsapp" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useCurrentUser();
  const initial = getInitials(user?.fullName);

  const handleLogout = () => {
    clearSession();
    navigate({ to: "/login" });
  };

  return (
    <>
      {/* Backdrop - Mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: open ? 0 : -280,
          transition: { type: "spring", stiffness: 300, damping: 30 },
        }}
        className="fixed left-0 top-0 z-50 h-screen w-72 bg-white lg:relative lg:translate-x-0"
      >
        <div className="flex h-full flex-col">
          {/* Header with Logo and Close */}
          <div className="flex items-center justify-between border-b border-ink-100 px-6 py-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div className="text-xs text-ink-500">Control Panel</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => {
                      setOpen(false);
                    }}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Profile Section */}
          <div className="border-t border-ink-100 p-4">
            <div className="flex items-center gap-3 rounded-xl bg-ink-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 overflow-hidden">
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt={user.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">{initial}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-ink-900">
                  {user?.fullName || "—"}
                </div>
                <div className="truncate text-xs text-ink-500 capitalize">
                  {user?.role?.toLowerCase() || "—"}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-50 hover:text-danger-600"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
