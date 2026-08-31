import { motion } from "framer-motion";
import { filterTabs } from "./notificationsData";

interface Props {
  active: string;
  onChange: (key: string) => void;
}

export default function NotificationFilters({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {filterTabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <motion.button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            whileTap={{ scale: 0.96 }}
            className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
              isActive
                ? "bg-primary-600 text-white shadow-float"
                : "border border-ink-200 bg-white text-ink-700 hover:border-primary-200 hover:text-primary-700"
            }`}
          >
            {tab.label}
          </motion.button>
        );
      })}
    </div>
  );
}
