import { motion } from "framer-motion";
import { Plus, Users, Wallet, FileText, Share2 } from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function RoomQuickActions() {
  const actions = [
    { icon: Plus, label: "Add Room", description: "Create a new room" },
    { icon: Plus, label: "Add Bed", description: "Add bed to existing room" },
    { icon: Users, label: "Assign Tenant", description: "Assign tenant to bed" },
    { icon: Wallet, label: "Collect Rent", description: "Record rent payment" },
    { icon: FileText, label: "Generate PDF", description: "Export room details" },
    { icon: Share2, label: "Share", description: "Share room information" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mt-12">
      <h3 className="mb-6 text-lg font-semibold text-ink-900">Quick Actions</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              variants={item}
              whileHover={{ y: -2 }}
              className="group rounded-xl border-2 border-ink-200 bg-white p-6 transition-all hover:border-primary-300 hover:shadow-md active:scale-95"
            >
              <Icon className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-ink-900">{action.label}</h4>
              <p className="mt-1 text-sm text-ink-600">{action.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
