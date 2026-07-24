import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction, SystemProgram } from "@solana/web3.js";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, ThumbsUp, ThumbsDown, Clock, BadgeCheck } from "lucide-react";
import type { Proposal, VoteStatus } from "../../types";
import { PROGRAM_ID } from "../../lib/constants";
import { deriveVotePda } from "../../lib/pda";
import VoteButton from "../ui/VoteButton";
import TransactionLink from "../ui/TransactionLink";
import Toast from "../ui/Toast";
import ResultBar from "../ui/ResultBar";

interface Props {
  proposal: Proposal;
  hasVoted: boolean;
  voteStatus: VoteStatus;
  refreshVoteStatus: () => Promise<void>;
}

function getInstructionData(proposalId: number, vote: boolean): Uint8Array {
  const data = new Uint8Array(17);
  const discriminator = new Uint8Array([20, 212, 15, 189, 69, 180, 69, 151]);
  data.set(discriminator, 0);
  new DataView(data.buffer).setBigUint64(8, BigInt(proposalId), true);
  data[16] = vote ? 1 : 0;
  return data;
}

export default function ProposalDetail({
  proposal,
  hasVoted,
  voteStatus,
  refreshVoteStatus,
}: Props) {
  const { connected, publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [voteChoice, setVoteChoice] = useState<boolean | null>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [yesCount, setYesCount] = useState(42);
  const [noCount, setNoCount] = useState(15);

  const isActive = new Date(proposal.endsAt) > new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(proposal.endsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  const handleVote = useCallback(async () => {
    setError(null);
    if (voteChoice === null) { setError("Select Yes or No first"); return; }
    if (!publicKey) { setError("Wallet not connected"); return; }
    if (!sendTransaction) { setError("Wallet does not support sendTransaction"); return; }

    setIsSubmitting(true);
    try {
      const programId = new PublicKey(PROGRAM_ID);
      const [pda] = deriveVotePda(proposal.id, publicKey);

      const data = getInstructionData(proposal.id, voteChoice);

      const ix = new TransactionInstruction({
        keys: [
          { pubkey: pda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId,
        data: data as unknown as Buffer,
      });

      const tx = new Transaction().add(ix);
      const { blockhash } = await connection.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = publicKey;

      const signature = await sendTransaction(tx, connection, {
        skipPreflight: true,
        maxRetries: 3,
      });

      setTxSignature(signature);
      if (voteChoice) {
        setYesCount((c) => c + 1);
      } else {
        setNoCount((c) => c + 1);
      }
      await refreshVoteStatus();
      setToast({ message: "Vote cast successfully!", type: "success" });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to cast vote.";
      setToast({ message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }, [voteChoice, publicKey, sendTransaction, proposal.id, connection, refreshVoteStatus]);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Proposals
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card"
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-600">
            {proposal.category.replace("-", " ")}
          </span>
          <span
            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-gray-200 bg-gray-100 text-gray-500"
            }`}
          >
            {isActive ? "Active" : "Ended"}
          </span>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-text sm:text-3xl">
          {proposal.title}
        </h1>

        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>by {proposal.author}</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {isActive
              ? `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
              : "Voting ended"}
          </span>
        </div>

        <p className="mb-8 leading-relaxed text-gray-600">
          {proposal.description}
        </p>

        <AnimatePresence mode="wait">
          {hasVoted || txSignature ? (
            <motion.div
              key="voted"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-success/20 bg-success/5 p-6"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-success">
                    <BadgeCheck className="h-4 w-4" />
                    Vote Recorded Successfully
                  </p>
                  {voteStatus.vote !== undefined && (
                    <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted">
                      Your vote:{" "}
                      <span className={`flex items-center gap-1 font-semibold ${voteStatus.vote ? "text-success" : "text-error"}`}>
                        {voteStatus.vote ? <ThumbsUp className="h-3.5 w-3.5" /> : <ThumbsDown className="h-3.5 w-3.5" />}
                        {voteStatus.vote ? "Yes" : "No"}
                      </span>
                    </p>
                  )}
                  {voteStatus.votedAt && (
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(voteStatus.votedAt * 1000).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                {txSignature && (
                  <div className="mt-2">
                    <TransactionLink signature={txSignature} />
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="voting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Cast your vote
              </h3>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setVoteChoice(true)}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-center font-semibold transition-all duration-200 disabled:opacity-40 ${
                    voteChoice === true
                      ? "border-success bg-success/10 text-success shadow-sm shadow-success/10"
                      : "border-border bg-bg text-muted hover:border-success/40 hover:bg-success/5 hover:text-success"
                  }`}
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span className="text-lg">Yes</span>
                </button>
                <button
                  onClick={() => setVoteChoice(false)}
                  disabled={isSubmitting}
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-4 text-center font-semibold transition-all duration-200 disabled:opacity-40 ${
                    voteChoice === false
                      ? "border-error bg-error/10 text-error shadow-sm shadow-error/10"
                      : "border-border bg-bg text-muted hover:border-error/40 hover:bg-error/5 hover:text-error"
                  }`}
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span className="text-lg">No</span>
                </button>
              </div>

              {connected ? (
                <VoteButton
                  disabled={voteChoice === null || isSubmitting}
                  onClick={handleVote}
                  loading={isSubmitting}
                />
              ) : (
                <VoteButton />
              )}
              {error && (
                <p className="mt-3 text-center text-sm text-error">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Current Results
          </h3>
          <ResultBar label="Yes" count={yesCount} total={yesCount + noCount} color="bg-success" />
          <div className="mt-2" />
          <ResultBar label="No" count={noCount} total={yesCount + noCount} color="bg-error" />
        </div>
      </motion.div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
