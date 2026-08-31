import { motion } from "framer-motion";
import { Menu, Bell, Search, Settings } from "lucide-react";
import { useCurrentUser, getInitials } from "@/lib/profile";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isDemo?: boolean;
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "👋 Good Morning";
  if (hour < 18) return "👋 Good Afternoon";
  return "👋 Good Evening";
};

export default function Header({ sidebarOpen, setSidebarOpen, isDemo }: HeaderProps) {
  const user = useCurrentUser();
  const firstName = user?.fullName?.split(" ")[0] || "there";
  const initial = getInitials(user?.fullName);

  return (
    <header className="border-b border-ink-100 bg-white">
      <div className="flex items-center justify-between px-6 py-4 sm:px-8 lg:px-10 relative">
        {/* Left */}
        <div className="flex items-center gap-4">
          {/* Menu Button - Mobile */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Greeting */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-bold text-ink-900"
            >
              {getGreeting()}, {firstName}
            </motion.h1>
            <p className="text-sm text-ink-500">
              Here&apos;s what&apos;s happening across your properties today.
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* Demo Mode Badge */}
          {isDemo && (
            <div className="hidden sm:flex items-center rounded-full border-2 border-primary-300 px-3 py-1 bg-primary-50">
              <span className="text-xs font-semibold text-primary-700">Demo Mode</span>
            </div>
          )}

          {/* Search - Desktop */}
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-ink-200 bg-ink-50 px-3 py-2">
            <Search className="h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-48 bg-transparent text-sm text-ink-900 placeholder-ink-400 outline-none"
            />
          </div>

          {/* Notification */}
          <button className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-500" />
          </button>

          {/* Profile */}
          <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold hover:shadow-md transition-all">
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.fullName}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              initial
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
