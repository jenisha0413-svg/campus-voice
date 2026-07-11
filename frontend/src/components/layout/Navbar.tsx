import { Link, useLocation } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { Vote, ClipboardList, BarChart3, Info } from "lucide-react";

export default function Navbar() {
  const { publicKey } = useWallet();
  const location = useLocation();

  const links = [
    { to: "/", label: "Active Proposals", icon: ClipboardList },
    { to: "/results", label: "Results", icon: BarChart3 },
    { to: "/about", label: "About", icon: Info },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <Vote className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-text">
              Campus Voice
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    location.pathname === link.to
                      ? "bg-primary-50 text-primary-500"
                      : "text-muted hover:bg-gray-50 hover:text-text"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {publicKey && (
            <span className="hidden rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-xs text-muted sm:inline">
              {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
            </span>
          )}
          <WalletMultiButton />
        </div>
      </div>
    </motion.nav>
  );
}
