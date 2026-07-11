import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useState, useCallback } from "react";
import { deriveVotePda } from "../lib/pda";
import type { VoteStatus } from "../types";

/**
 * useVoteStatus — checks whether the connected wallet has voted on a
 * proposal and returns the on-chain vote data.
 *
 * How it works:
 *  1. Derives the PDA address for (proposalId, connected wallet).
 *  2. Calls getAccountInfo on that address.
 *  3. If the account exists, borsh-deserializes it to extract the
 *     boolean `vote` value and the `voted_at` timestamp.
 *  4. Returns { voted: true, vote, votedAt } or { voted: false }.
 *
 * The `refresh` function is exposed so the parent can re-check after
 * a vote transaction is confirmed.
 */
export function useVoteStatus(proposalId: number): {
  voteStatus: VoteStatus;
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [voteStatus, setVoteStatus] = useState<VoteStatus>({ voted: false });
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!publicKey || !proposalId) {
      setVoteStatus({ voted: false });
      return;
    }

    setLoading(true);
    try {
      const [pda] = deriveVotePda(proposalId, publicKey);
      const accountInfo = await connection.getAccountInfo(pda);

      if (accountInfo && accountInfo.data) {
        // Parse the account data manually.
        // Layout (after 8-byte Anchor discriminator):
        //   wallet:      32 bytes (Pubkey)
        //   proposal_id:  8 bytes (u64 LE)
        //   vote:         1 byte  (bool: 0 = false, 1 = true)
        //   voted_at:     8 bytes (i64 LE)
        const data = accountInfo.data;
        const DISCRIMINATOR = 8;

        // Skip discriminator (8) + wallet (32) + proposal_id (8) = 48 bytes
        const VOTE_OFFSET = DISCRIMINATOR + 32 + 8;
        const VOTED_AT_OFFSET = VOTE_OFFSET + 1;

        const vote = data.readUInt8(VOTE_OFFSET) === 1;
        const votedAt = Number(data.readBigInt64LE(VOTED_AT_OFFSET));

        setVoteStatus({ voted: true, vote, votedAt });
      } else {
        setVoteStatus({ voted: false });
      }
    } catch {
      setVoteStatus({ voted: false });
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, proposalId]);

  return { voteStatus, loading, refresh };
}
