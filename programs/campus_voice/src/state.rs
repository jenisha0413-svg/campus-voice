/// Campus Voice — Account state definitions.
///
/// Each on-chain account is represented by a struct decorated with
/// `#[account]`. Anchor prepends an 8-byte discriminator (SHA-256 hash
/// of `"account:<StructName>"`) so it can identify the account type at
/// deserialization time.

use anchor_lang::prelude::*;

/// VoteRecord — one per wallet per proposal.
///
/// Stored at a Program Derived Address (PDA) so that the blockchain itself
/// enforces uniqueness: the same (proposal_id, wallet) pair can never
/// produce two different PDA addresses, and the `init` constraint in the
/// instruction will reject the second attempt.
///
/// # PDA Seeds
/// ```text
/// ["vote", proposal_id.to_le_bytes(), wallet_pubkey]
/// ```
///
/// # Fields
/// * `wallet`      — The public key of the voter (32 bytes).
/// * `proposal_id` — Numeric proposal identifier (8 bytes, little-endian u64).
/// * `vote`        — The boolean choice: `true` = yes/for, `false` = no/against (1 byte).
/// * `voted_at`    — Unix timestamp when the vote was cast (8 bytes, i64).
#[account]
pub struct VoteRecord {
    pub wallet: Pubkey,
    pub proposal_id: u64,
    pub vote: bool,
    pub voted_at: i64,
}

impl VoteRecord {
    /// Space (in bytes) allocated for this account on-chain.
    ///
    /// Breakdown:
    /// - 8 bytes  : Anchor account discriminator (auto-prepended)
    /// - 32 bytes : wallet (Pubkey)
    /// - 8 bytes  : proposal_id (u64)
    /// - 1 byte   : vote (bool)
    /// - 8 bytes  : voted_at (i64)
    /// ---
    /// = 57 bytes total
    ///
    /// We allocate a bit of extra padding (to 128 bytes) so the account
    /// lives comfortably on-chain and leaves room for future fields if
    /// the program is upgraded.
    pub const LEN: usize = 8 + 32 + 8 + 1 + 8;
}
