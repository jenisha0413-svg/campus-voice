import { motion } from "framer-motion";
import { ClipboardList, Vote, Users, CircleDot } from "lucide-react";

const stats = [
  { label: "Active Proposals", value: "5", icon: ClipboardList },
  { label: "Total Votes", value: "1,247", icon: Vote },
  { label: "Connected Wallets", value: "89", icon: Users },
  { label: "Network", value: "Solana", icon: CircleDot },
];

export default function StatsSection() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3"
              >
                <Icon className="h-5 w-5 text-primary-500" />
                <div>
                  <p className="text-lg font-bold text-text">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
