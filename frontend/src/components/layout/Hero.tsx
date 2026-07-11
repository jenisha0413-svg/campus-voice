import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Landmark, ArrowDown } from "lucide-react";

export default function Hero() {
  const { connected } = useWallet();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
            <Landmark className="h-4 w-4" />
            Student Governance Platform
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-text sm:text-5xl lg:text-6xl">
            Your Campus.{" "}
            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Every Voice Matters.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            A trusted platform for transparent campus governance. Cast your vote
            on student proposals, shape the decisions that affect your community,
            and see every outcome verified in real time.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!connected && (
              <WalletMultiButton className="!rounded-xl !h-12 !text-sm !font-semibold !px-6" />
            )}
            <a
              href="#proposals"
              className="btn-secondary inline-flex items-center gap-2"
            >
              View Active Proposals
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
