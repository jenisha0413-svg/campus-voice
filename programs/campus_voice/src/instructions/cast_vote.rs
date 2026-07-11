/// Campus Voice — `cast_vote` instruction.
///
/// This is the core (and only) instruction in the program. It lets a
/// connected wallet cast a single boolean vote on a proposal.
///
/// ## How the one-vote-per-wallet guarantee works
///
/// Solana Program Derived Addresses (PDAs) are deterministic: given the
/// same seeds and program ID you always get the same address. We derive
/// the PDA as:
///
/// ```text
/// PDA = find_program_address(
///     seeds = [
///         b"vote",                          // namespace prefix
///         &proposal_id.to_le_bytes(),       // 8-byte u64, little-endian
///         voter_wallet.key().as_ref(),      // 32-byte public key
///     ],
///     program_id = CAMPUS_VOICE_PROGRAM_ID,
/// )
/// ```
///
/// Because the PDA depends on *both* `proposal_id` and `wallet`, each
/// wallet can only ever produce one PDA per proposal. The `init`
/// constraint in the accounts struct creates this account on the first
/// call; any subsequent call with the same seeds fails because the
/// account already exists — enforcing the one-vote rule at the protocol
/// level, without needing a separate check.
///
/// ## Account layout
///
/// | Field        | Type   | Bytes | Description                              |
/// |--------------|--------|------:|------------------------------------------|
/// | discriminator| [u8;8] |     8 | Anchor auto-derived from struct name     |
/// | wallet       | Pubkey |    32 | Public key of the voter                  |
/// | proposal_id  | u64    |     8 | Numeric proposal identifier              |
/// | vote         | bool   |     1 | true = yes/for, false = no/against       |
/// | voted_at     | i64    |     8 | Unix timestamp of vote                   |
/// | **Total**    |        |    57 |                                          |

use anchor_lang::prelude::*;

use crate::errors::CampusVoiceError;
use crate::state::VoteRecord;

/// Accounts required by the `cast_vote` instruction.
///
/// Anchor validates every field at runtime:
/// - `init`       → creates the account if it doesn't exist, errors if it does
/// - `mut`        → the account balance may change (rent deduction)
/// - `seeds + bump`→ derives the PDA deterministically
/// - `payer`      → the account that funds the new PDA's rent-exempt balance
#[derive(Accounts)]
// The `#[instruction]` macro makes the instruction arguments available
// inside the account validation logic. Here we need `proposal_id` to
// derive the PDA seeds.
#[instruction(proposal_id: u64)]
pub struct CastVote<'info> {
    /// The PDA account that will store this vote.
    ///
    /// Seeds: `[b"vote", proposal_id.to_le_bytes(), voter.key()]`
    ///
    /// `init` means Anchor will call `SystemProgram::create_account` to
    /// allocate `VoteRecord::LEN` bytes, assign ownership to our program,
    /// and deserialize the account into a `VoteRecord`. If an account at
    /// this PDA already exists (i.e. this wallet already voted on this
    /// proposal), the transaction fails — this is how we enforce
    /// one-vote-per-wallet.
    #[account(
        init,
        payer = voter,
        space = VoteRecord::LEN,
        seeds = [b"vote".as_ref(), &proposal_id.to_le_bytes(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    /// The wallet casting the vote.
    ///
    /// `mut`  → SOL will be deducted to pay for the PDA's rent.
    /// `signer` → the wallet must cryptographically sign this transaction,
    ///             proving ownership of the private key.
    #[account(mut)]
    pub voter: Signer<'info>,

    /// The Solana System Program — required for creating new accounts.
    /// Anchor injects this automatically if omitted, but being explicit
    /// is clearer for auditing.
    pub system_program: Program<'info, System>,
}

/// Emitted after a successful vote. Clients (indexers, frontends) can
/// subscribe to this event to track votes in real time without polling.
#[event]
pub struct VoteCast {
    pub wallet: Pubkey,
    pub proposal_id: u64,
    pub vote: bool,
    pub voted_at: i64,
}

/// Instruction handler — called after Anchor validates the accounts.
///
/// At this point we know:
/// 1. `vote_record` is a freshly created account at the expected PDA.
/// 2. `voter` signed the transaction and is paying for the account.
/// 3. The `system_program` is the real System Program.
///
/// All we do here is write data into the account and emit an event.
pub fn handler(ctx: Context<CastVote>, proposal_id: u64, vote: bool) -> Result<()> {
    // --- Validate arguments ------------------------------------------------
    // proposal_id is a u64, so it's always valid. We still guard against
    // obviously nonsensical values if the business logic requires it.
    // For now any u64 is accepted.

    // --- Populate account data ---------------------------------------------
    let vote_record = &mut ctx.accounts.vote_record;

    // The wallet that cast this vote.
    vote_record.wallet = ctx.accounts.voter.key();

    // Which proposal this vote belongs to.
    vote_record.proposal_id = proposal_id;

    // The actual boolean choice.
    vote_record.vote = vote;

    // On-chain timestamp so we can order votes chronologically.
    vote_record.voted_at = Clock::get()?.unix_timestamp;

    // --- Emit event --------------------------------------------------------
    // Frontend and indexers can listen for `VoteCast` to update UIs in real
    // time without having to parse raw account data.
    emit!(VoteCast {
        wallet: vote_record.wallet,
        proposal_id,
        vote,
        voted_at: vote_record.voted_at,
    });

    Ok(())
}
