import { useState } from "react";
import type { Proposal } from "../types";
import proposalsData from "../data/proposals.json";

export function useProposals(): {
  proposals: Proposal[];
  loading: boolean;
  error: string | null;
  getProposalById: (id: number) => Proposal | undefined;
} {
  const [proposals] = useState<Proposal[]>(proposalsData as Proposal[]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const getProposalById = (id: number): Proposal | undefined => {
    return proposals.find((p) => p.id === id);
  };

  return { proposals, loading, error, getProposalById };
}
