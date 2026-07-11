import { motion } from "framer-motion";

interface Props {
  connected: boolean;
  publicKey: string | null;
}

export default function WalletBadge({ connected, publicKey }: Props) {
  if (!connected || !publicKey) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 shadow-card"
    >
      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
      <span className="font-mono text-xs text-muted">
        {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
      </span>
    </motion.div>
  );
}
