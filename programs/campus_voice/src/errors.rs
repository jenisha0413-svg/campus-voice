/// Campus Voice — Custom error codes.
///
/// Anchor errors分为两部分:
///   1. Built-in errors (e.g. account already exists, wrong signer).
///   2. Custom errors defined here, starting at code 6000.
///
/// These give user-friendly messages when a transaction fails.

use anchor_lang::prelude::*;

#[error_code]
pub enum CampusVoiceError {
    /// Returned if someone tries to vote twice on the same proposal.
    /// In practice this is caught by the `init` constraint (the PDA
    /// already exists), but we keep this for explicit checks or
    /// future instruction variants.
    #[msg("You have already voted on this proposal.")]
    AlreadyVoted,

    /// Returned if the proposal voting window has closed.
    #[msg("Proposal voting period has ended.")]
    VotingEnded,

    /// Returned if someone tries to vote before voting opens.
    #[msg("Proposal voting period has not started.")]
    VotingNotStarted,
}
