import { Vote } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-500">
            <Vote className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-text">Campus Voice</span>
        </div>
        <p className="text-sm text-muted">
          Decentralized Student Governance · Built on Solana
        </p>
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Campus Voice
        </p>
      </div>
    </footer>
  );
}
