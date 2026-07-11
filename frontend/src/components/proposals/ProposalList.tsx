import { ClipboardList } from "lucide-react";
import type { Proposal } from "../../types";
import ProposalCard from "./ProposalCard";

interface Props {
  proposals: Proposal[];
  loading?: boolean;
}

export default function ProposalList({ proposals, loading }: Props) {
  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse">
            <div className="mb-3 flex gap-2">
              <div className="h-6 w-20 rounded-lg bg-gray-100" />
              <div className="h-6 w-16 rounded-lg bg-gray-100" />
            </div>
            <div className="mb-2 h-5 w-3/4 rounded-lg bg-gray-100" />
            <div className="mb-1 h-3 w-full rounded bg-gray-50" />
            <div className="mb-4 h-3 w-5/6 rounded bg-gray-50" />
            <div className="border-t border-border pt-3">
              <div className="h-3 w-20 rounded bg-gray-50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface py-20 text-center shadow-card">
        <ClipboardList className="mx-auto mb-3 h-12 w-12 text-gray-300" />
        <p className="text-lg font-medium text-text">No proposals yet</p>
        <p className="mt-1 text-sm text-muted">
          Proposals will appear here once they are created.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {proposals.map((proposal, i) => (
        <ProposalCard key={proposal.id} proposal={proposal} index={i} />
      ))}
    </div>
  );
}
