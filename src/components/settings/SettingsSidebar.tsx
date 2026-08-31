import { motion } from "framer-motion";

interface SettingsSidebarProps {
  sections: Array<{ id: string; label: string }>;
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export default function SettingsSidebar({
  sections,
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <aside className="w-64 border-r border-ink-200 bg-white px-6 py-8 overflow-y-auto hidden lg:block">
      <div>
        <h2 className="text-lg font-semibold text-ink-900 mb-6">Settings</h2>
        <nav className="space-y-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary-50 text-primary-700 border-l-2 border-primary-600"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                }`}
              >
                <motion.div
                  initial={false}
                  animate={{
                    paddingLeft: isActive ? "1rem" : "0rem",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {section.label}
                </motion.div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
