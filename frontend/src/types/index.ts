export interface Proposal {
  id: number;               // u64 on-chain
  title: string;
  description: string;
  author: string;
  category: string;
  createdAt: string;
  endsAt: string;
}

export interface VoteRecord {
  wallet: string;
  proposalId: number;
  vote: boolean;
  votedAt: number;
  txSignature: string;
}

export interface VoteStatus {
  voted?: boolean;
  vote?: boolean;
  votedAt?: number;
  txSignature?: string;
}
