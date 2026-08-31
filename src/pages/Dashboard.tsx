import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppLink as Link } from "@/components/ui/AppLink";
import {
  Menu,
  X,
  Home,
  Building2,
  BedDouble,
  Users,
  Wallet,
  FileText,
  MessageCircle,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  Plus,
  Send,
  Zap,
  MoreVertical,
  Activity,
  Info,
} from "lucide-react";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import SummaryCards from "@/components/dashboard/SummaryCards";
import TodaysFocus from "@/components/dashboard/TodaysFocus";
import QuickActions from "@/components/dashboard/QuickActions";
import RentChart from "@/components/dashboard/RentChart";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    setIsDemo(new URLSearchParams(window.location.search).get("demo") === "true");
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="border-b border-primary-200 bg-primary-50 px-6 py-3 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Info className="h-5 w-5 text-primary-600 flex-shrink-0" />
              <p className="text-sm font-medium text-primary-900">
                You are viewing a demonstration of StayHub. Data shown is sample data.
              </p>
            </div>
            <Link to="/register">
              <button className="flex-shrink-0 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:bg-primary-700 active:scale-95">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isDemo={isDemo} />

          {/* Dashboard Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-8 sm:px-8 lg:px-10">
              {/* Summary Cards */}
              <SummaryCards />

              {/* Today's Focus & Quick Actions */}
              <div className="mt-8 grid gap-8 lg:grid-cols-3">
                {/* Today's Focus */}
                <div className="lg:col-span-2">
                  <TodaysFocus />
                </div>

                {/* Quick Actions */}
                <div>
                  <QuickActions />
                </div>
              </div>

              {/* Rent Chart & Activity */}
              <div className="mt-8 grid gap-8 lg:grid-cols-3">
                {/* Rent Collection Chart */}
                <div className="lg:col-span-2">
                  <RentChart />
                </div>

                {/* Recent Activity */}
                <div>
                  <RecentActivity />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
