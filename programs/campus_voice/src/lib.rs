/// Campus Voice — Anchor entrypoint.
///
/// This module wires the program's public instructions to their handler
/// functions. Anchor dispatches to the matching function based on the
/// 8-byte instruction discriminator derived from the function name.

use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod state;

// Re-export the CastVote accounts struct so the #[program] macro can see it.
use instructions::cast_vote::*;

// Replace with your actual program ID after running `anchor build`.
// The ID is derived from your wallet's keypair in `target/deploy/`.
declare_id!("2h198Q9MNSFGWo2aJeEq2CRFSSfykfFVKUkbDJhyzrAf");

#[program]
pub mod campus_voice {
    use super::*;

    /// Cast a vote on a proposal.
    ///
    /// # Arguments
    /// * `ctx`        — Accounts context (vote_record PDA, voter signer, system_program)
    /// * `proposal_id`— Numeric identifier of the proposal (u64)
    /// * `vote`       — The voter's choice: `true` = yes/for, `false` = no/against
    ///
    /// # Behaviour
    /// 1. A PDA is derived from seeds `["vote", proposal_id.to_le_bytes(), voter_pubkey]`.
    /// 2. Anchor's `init` constraint tries to create a new account at that address.
    /// 3. If the account already exists (wallet already voted on this proposal),
    ///    the transaction fails with an account-already-exists error — enforcing
    ///    the one-vote-per-wallet-per-proposal rule without any custom check.
    /// 4. The account data is populated and a `VoteCast` event is emitted.
    pub fn cast_vote(
        ctx: Context<CastVote>,
        proposal_id: u64,
        vote: bool,
    ) -> Result<()> {
        instructions::cast_vote::handler(ctx, proposal_id, vote)
    }
}
