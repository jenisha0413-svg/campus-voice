import { ExternalLink, ReceiptText } from "lucide-react";

interface Props {
  signature: string;
}

const SOLANA_EXPLORER_URL = "https://explorer.solana.com/tx";

export default function TransactionLink({ signature }: Props) {
  const url = `${SOLANA_EXPLORER_URL}/${signature}?cluster=devnet`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-bg px-4 py-2 text-sm font-medium text-primary-500 transition-all hover:border-primary-200 hover:bg-primary-50"
    >
      <ReceiptText className="h-4 w-4" />
      View on Solana Explorer
      <ExternalLink className="h-3.5 w-3.5 opacity-50" />
    </a>
  );
}
