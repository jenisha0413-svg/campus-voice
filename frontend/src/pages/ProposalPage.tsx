import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { ArrowLeft } from "lucide-react";
import proposalsData from "../data/proposals.json";
import type { Proposal, VoteStatus } from "../types";
import { deriveVotePda } from "../lib/pda";
import ProposalDetail from "../components/proposals/ProposalDetail";

const proposals = proposalsData as Proposal[];

export default function ProposalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [hasVoted, setHasVoted] = useState(false);
  const [voteStatus, setVoteStatus] = useState<VoteStatus>({});

  const proposal = proposals.find((p) => p.id === Number(id));

  const refreshVoteStatus = async () => {
    if (!publicKey || !proposal) return;
    try {
      const [pda] = deriveVotePda(proposal.id, publicKey);
      const accountInfo = await connection.getAccountInfo(pda);
      if (accountInfo?.data) {
        const data = accountInfo.data;
        const DISC_LEN = 8;
        const WALLET_LEN = 32;
        const PROPOSAL_ID_LEN = 8;

        if (data.length >= DISC_LEN + WALLET_LEN + PROPOSAL_ID_LEN + 1 + 8) {
          const vote = data[DISC_LEN + WALLET_LEN + PROPOSAL_ID_LEN] === 1;
          const votedAt = Number(
            data.readBigUInt64LE(DISC_LEN + WALLET_LEN + PROPOSAL_ID_LEN + 1)
          );
          setVoteStatus({ vote, votedAt });
          setHasVoted(true);
        }
      }
    } catch {
      // PDA not found, user hasn't voted
    }
  };

  useEffect(() => {
    refreshVoteStatus();
  }, [publicKey, proposal]);

  if (!proposal) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="mb-3 text-2xl font-bold text-text">Proposal Not Found</h1>
        <p className="mb-6 text-muted">
          The proposal you're looking for doesn't exist or has been removed.
        </p>
        <button onClick={() => navigate("/")} className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-10 sm:px-6">
      <ProposalDetail
        proposal={proposal}
        hasVoted={hasVoted}
        voteStatus={voteStatus}
        refreshVoteStatus={refreshVoteStatus}
      />
    </div>
  );
}
