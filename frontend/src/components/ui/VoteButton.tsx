import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LoaderCircle } from "lucide-react";

interface Props {
  disabled?: boolean;
  onClick?: () => void;
  loading?: boolean;
}

export default function VoteButton({ disabled, onClick, loading }: Props) {
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted">Connect your wallet to vote</p>
        <WalletMultiButton className="!rounded-xl !h-11 !text-sm !font-semibold !px-6" />
      </div>
    );
  }

  return (
    <motion.button
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      onClick={onClick}
      disabled={disabled || loading}
      className="btn-primary w-full"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Sending Vote...
        </span>
      ) : (
        "Cast Vote"
      )}
    </motion.button>
  );
}
