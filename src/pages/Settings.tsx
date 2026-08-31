import { useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/dashboard/Sidebar";
import Header from "@/components/dashboard/Header";
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import Account from "@/components/settings/sections/Account";
import PropertyDefaults from "@/components/settings/sections/PropertyDefaults";
import RentSettings from "@/components/settings/sections/RentSettings";
import WhatsAppSettings from "@/components/settings/sections/WhatsAppSettings";
import Notifications from "@/components/settings/sections/Notifications";
import PDFReports from "@/components/settings/sections/PDFReports";
import UsersPermissions from "@/components/settings/sections/UsersPermissions";
import Security from "@/components/settings/sections/Security";
import Appearance from "@/components/settings/sections/Appearance";
import Billing from "@/components/settings/sections/Billing";
import Integrations from "@/components/settings/sections/Integrations";
import BackupExport from "@/components/settings/sections/BackupExport";
import About from "@/components/settings/sections/About";

const SECTIONS = [
  { id: "account", label: "Account" },
  { id: "property-defaults", label: "Property Defaults" },
  { id: "rent-settings", label: "Rent Settings" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "notifications", label: "Notifications" },
  { id: "pdf-reports", label: "PDF & Reports" },
  { id: "users-permissions", label: "Users & Permissions" },
  { id: "security", label: "Security" },
  { id: "appearance", label: "Appearance" },
  { id: "billing", label: "Billing" },
  { id: "integrations", label: "Integrations" },
  { id: "backup-export", label: "Backup & Export" },
  { id: "about", label: "About" },
];

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("account");

  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <Account />;
      case "property-defaults":
        return <PropertyDefaults />;
      case "rent-settings":
        return <RentSettings />;
      case "whatsapp":
        return <WhatsAppSettings />;
      case "notifications":
        return <Notifications />;
      case "pdf-reports":
        return <PDFReports />;
      case "users-permissions":
        return <UsersPermissions />;
      case "security":
        return <Security />;
      case "appearance":
        return <Appearance />;
      case "billing":
        return <Billing />;
      case "integrations":
        return <Integrations />;
      case "backup-export":
        return <BackupExport />;
      case "about":
        return <About />;
      default:
        return <Account />;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-ink-50">
      <div className="flex flex-1 overflow-hidden">
        {/* App Sidebar */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} isDemo={false} />

          {/* Settings Content */}
          <main className="flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Settings Sidebar */}
              <SettingsSidebar
                sections={SECTIONS}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
              />

              {/* Main Settings Panel */}
              <div className="flex-1 overflow-y-auto">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-8 sm:px-8 lg:px-10"
                >
                  {renderSection()}
                </motion.div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
