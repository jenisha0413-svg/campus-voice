import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Link } from "react-router-dom";

export default function Header() {
  const { publicKey } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/60 bg-gray-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          to="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-lg shadow-brand-600/30">
            CV
          </div>
          <span className="text-lg font-semibold text-gray-100">
            Campus Voice
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {publicKey && (
            <span className="hidden rounded-full bg-gray-800/80 px-3 py-1.5 font-mono text-xs text-gray-400 sm:inline">
              {publicKey.toBase58().slice(0, 4)}...
              {publicKey.toBase58().slice(-4)}
            </span>
          )}
          <WalletMultiButton className="!bg-brand-600 hover:!bg-brand-500 !rounded-xl !h-10 !text-sm !px-4 !transition-all !duration-200" />
        </div>
      </div>
    </header>
  );
}
