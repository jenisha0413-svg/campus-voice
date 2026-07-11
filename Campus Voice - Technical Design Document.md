# Campus Voice — Technical Design Document

**Version:** 1.0
**Date:** July 11, 2026
**Status:** Pre-Development

---

## 1. Project Overview

Campus Voice is a decentralized student governance platform where users connect a Solana wallet (Phantom) and vote on campus proposals. Proposal metadata (title, description, options) lives off-chain in a local JSON file. Votes are stored on-chain via an Anchor smart contract on Solana Devnet. Each wallet can vote exactly once per proposal. Every vote returns a transaction signature viewable on Solana Explorer.

---

## 2. Technology Stack

| Layer             | Technology                          |
|-------------------|-------------------------------------|
| Frontend          | React 18 + Vite + TypeScript        |
| Styling           | Tailwind CSS 3                      |
| Wallet Integration| @solana/wallet-adapter-react + phantom |
| Blockchain        | Solana Devnet                       |
| Smart Contract    | Anchor (Rust)                       |
| Off-chain Data    | Local JSON file (served via Vite)   |
| State Management  | React Context + hooks               |
| Build Tool        | Vite                                |
| Package Manager   | npm                                 |

---

## 3. Folder Structure

```
campus-voice/
├── Anchor.toml
├── Cargo.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
│
├── programs/
│   └── campus_voice/
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs              # Program entrypoint + instruction dispatch
│           ├── state.rs            # Account struct definitions (VoteRecord)
│           ├── errors.rs           # Custom error codes
│           └── instructions/
│               ├── mod.rs
│               ├── initialize.rs   # (optional) program-level config
│               └── cast_vote.rs    # Core vote instruction
│
├── migrations/
│
├── tests/
│   └── campus_voice.ts             # Anchor integration tests
│
├── target/
│   └── idl/
│       └── campus_voice.json       # Generated IDL
│
├── src/                            # React frontend
│   ├── main.tsx                    # App entrypoint
│   ├── App.tsx                     # Root component + router
│   ├── vite-env.d.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Nav bar + wallet connect button
│   │   │   └── Footer.tsx
│   │   ├── wallet/
│   │   │   └── WalletProvider.tsx  # Solana Wallet Adapter provider wrapper
│   │   ├── proposals/
│   │   │   ├── ProposalList.tsx    # Grid/list of all proposals
│   │   │   ├── ProposalCard.tsx    # Single proposal summary card
│   │   │   └── ProposalDetail.tsx  # Full proposal view + voting UI
│   │   └── ui/
│   │       ├── VoteButton.tsx      # Cast vote CTA
│   │       ├── TransactionLink.tsx # "View on Explorer" link
│   │       ├── ConnectedBalance.tsx
│   │       └── Toast.tsx           # Success/error notifications
│   │
│   ├── hooks/
│   │   ├── useProgram.ts           # Anchor Program instance
│   │   ├── useVote.ts              # Cast vote transaction logic
│   │   ├── useVoteStatus.ts        # Check if wallet already voted
│   │   └── useProposals.ts         # Load proposals from JSON
│   │
│   ├── lib/
│   │   ├── anchor.ts               # Program ID, connection config
│   │   ├── pda.ts                   # PDA derivation helpers
│   │   └── constants.ts            # Network, program ID, etc.
│   │
│   ├── data/
│   │   └── proposals.json          # Off-chain proposal metadata
│   │
│   ├── pages/
│   │   ├── Home.tsx                # Landing / proposal list
│   │   └── ProposalPage.tsx        # Single proposal detail (route: /proposal/:id)
│   │
│   ├── styles/
│   │   └── index.css               # Tailwind directives + global styles
│   │
│   └── types/
│       └── index.ts                # Shared TypeScript interfaces
│
└── public/
    └── favicon.svg
```

---

## 4. Off-Chain Data: `proposals.json`

```json
[
  {
    "id": "proposal-001",
    "title": "Extend Library Hours on Weekends",
    "description": "Vote to extend library operating hours to midnight on Saturdays and Sundays during the academic semester.",
    "options": [
      { "label": "Yes, extend hours", "value": "yes" },
      { "label": "No, keep current hours", "value": "no" }
    ],
    "author": "Student Council",
    "category": "campus-life",
    "createdAt": "2026-07-01T00:00:00Z",
    "endsAt": "2026-08-01T00:00:00Z",
    "imageUrl": null
  }
]
```

The `id` field is used as the seed to derive the PDA that stores votes on-chain. This is the critical link between off-chain metadata and on-chain state.

### TypeScript Interfaces

```typescript
// src/types/index.ts

interface ProposalOption {
  label: string;
  value: string;
}

interface Proposal {
  id: string;                  // unique identifier, also used as PDA seed
  title: string;
  description: string;
  options: ProposalOption[];
  author: string;
  category: string;
  createdAt: string;
  endsAt: string;
  imageUrl: string | null;
}

interface VoteRecord {
  wallet: string;              // voter's public key (base58)
  proposalId: string;          // matches Proposal.id
  optionValue: string;         // which option was voted for
  votedAt: string;             // ISO timestamp
  txSignature: string;         // Solana transaction signature
}
```

---

## 5. On-Chain Design

### 5.1 Program ID

```
CVoice11111111111111111111111111111111111111111
```

(Actual ID generated at `anchor build` time and stored in `Anchor.toml` and `src/lib/constants.ts`.)

### 5.2 PDA Structure

Each vote is stored in its own account. The PDA is derived from:

```
seeds = [b"vote", proposal_id.as_bytes(), voter_wallet.key().as_ref()]
bump  = find_program_address(seeds, program_id)
```

This guarantees:
- **One vote per wallet per proposal** — the PDA is unique per (proposal, voter) pair.
- **Deterministic derivation** — the frontend can derive the same address to check vote status.

### 5.3 Account Layouts

#### VoteRecord Account

```
Discriminator:   8 bytes  (Anchor SHA256("account:VoteRecord"))
Wallet:         32 bytes  (Pubkey — the voter)
ProposalId:     [u8]      (UTF-8 string, length-prefixed by borsh)
OptionValue:    [u8]      (UTF-8 string, length-prefixed by borsh)
VotedAt:         8 bytes  (i64 — Unix timestamp)
```

Anchor auto-prepends the 8-byte discriminator. Borsh serialization handles the variable-length strings with a 4-byte little-endian length prefix.

**Account size estimate:** 8 + 32 + (4 + max 64) + (4 + max 32) + 8 = ~152 bytes per vote record. We set the account size at **200 bytes** with padding.

#### Rust Struct (programs/campus_voice/src/state.rs)

```rust
#[account]
pub struct VoteRecord {
    pub wallet: Pubkey,         // 32 bytes
    pub proposal_id: String,    // borsh: 4-byte len + UTF-8 bytes
    pub option_value: String,   // borsh: 4-byte len + UTF-8 bytes
    pub voted_at: i64,          // 8 bytes (Unix timestamp)
}
```

Space calculation:

```
8 (discriminator) + 32 (wallet) + 4 + PROPOSAL_ID_MAX + 4 + OPTION_VALUE_MAX + 8 (voted_at)
= 8 + 32 + 4 + 64 + 4 + 32 + 8 = 152 bytes
Allocated: 200 bytes (with room for bump seed if needed)
```

### 5.4 Error Codes

```rust
// programs/campus_voice/src/errors.rs

#[error_code]
pub enum CampusVoiceError {
    #[msg("You have already voted on this proposal.")]
    AlreadyVoted,

    #[msg("Invalid option value for this proposal.")]
    InvalidOption,

    #[msg("Proposal voting period has ended.")]
    VotingEnded,

    #[msg("Proposal voting period has not started.")]
    VotingNotStarted,

    #[msg("Proposal ID cannot be empty.")]
    EmptyProposalId,

    #[msg("Option value cannot be empty.")]
    EmptyOptionValue,
}
```

### 5.5 Instruction Definitions

#### `cast_vote`

**Accounts required:**

| Account               | Type    | Writable | Signer | Description                        |
|-----------------------|---------|----------|--------|------------------------------------|
| vote_record           | PDA     | Yes      | No     | The PDA storing the vote           |
| voter                 | Wallet  | Yes      | Yes    | The user casting the vote          |
| system_program        | Program | No       | No     | Required for account creation      |

**Instruction data (borsh-encoded):**

```
{
    proposal_id: string,    // max 64 bytes UTF-8
    option_value: string,   // max 32 bytes UTF-8
}
```

**Logic flow:**

1. Validate `proposal_id` is not empty.
2. Validate `option_value` is not empty.
3. Derive PDA with seeds `[b"vote", proposal_id, voter.key()]`.
4. If PDA account already exists → return `AlreadyVoted` error.
5. Optionally validate `option_value` against known options (or leave this to the frontend — on-chain we store what the user submits).
6. Create the PDA account (200 bytes, funded by the voter).
7. Write the `VoteRecord` data into the account.
8. Emit a `VoteCast` event (optional but recommended for indexing).

#### Event (optional, for off-chain indexing)

```rust
#[event]
pub struct VoteCast {
    pub wallet: Pubkey,
    pub proposal_id: String,
    pub option_value: String,
    pub voted_at: i64,
}
```

---

## 6. Data Flow

### 6.1 Loading Proposals

```
proposals.json  →  useProposals() hook  →  ProposalList component
                   (fetched at build time    (renders ProposalCard for each)
                    or via dynamic import)
```

No blockchain call needed. Vite bundles the JSON directly into the app, or it can be fetched at runtime via `fetch('/data/proposals.json')`.

### 6.2 Casting a Vote

```
User clicks "Vote" on ProposalDetail
  → useVoteStatus() confirms wallet has NOT voted (checks PDA existence)
  → User selects option
  → User clicks "Confirm Vote"
  → useVote() executes:
      1. Derives PDA: [b"vote", proposal.id, wallet.publicKey]
      2. Builds instruction: cast_vote(proposal.id, option.value)
      3. Sends transaction via wallet adapter (Phantom signs)
      4. Confirms transaction
      5. Returns txSignature
  → UI shows TransactionLink (Solana Explorer URL)
  → useVoteStatus() re-checks → now returns "voted" + the VoteRecord data
  → Vote count displayed (derived from Explorer / RPC getProgramAccounts or local cache)
```

### 6.3 Checking Vote Status

```
ProposalDetail mounts
  → useVoteStatus(proposalId, walletPublicKey)
      → derives PDA
      → calls getAccount(pda)
      → if exists: returns { voted: true, optionValue, votedAt, txSignature }
      → if null:   returns { voted: false }
```

### 6.4 Getting Vote Counts

Since individual votes are per-wallet PDA accounts, we derive counts via one of two strategies:

**Option A — `getProgramAccounts` with filter (simple, works on Devnet):**

```typescript
connection.getProgramAccounts(PROGRAM_ID, {
  filters: [
    { dataSize: 200 },
    { memcmp: { offset: 8 + 32, bytes: proposalId } }  // after discriminator + wallet
  ]
});
```

This returns all VoteRecord accounts for a given proposal. The frontend groups by `optionValue` and counts.

**Option B — Indexer (future enhancement):** Listen to `VoteCast` events and maintain a server-side count.

For Devnet with low traffic, **Option A is sufficient.**

---

## 7. Frontend Architecture

### 7.1 Provider Tree

```tsx
// src/App.tsx
<WalletProvider>
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/proposal/:id" element={<ProposalPage />} />
    </Routes>
  </BrowserRouter>
</WalletProvider>
```

### 7.2 Wallet Integration

```
WalletProvider.tsx
  ├── @solana/wallet-adapter-react  →  ConnectionProvider + WalletProvider
  ├── @solana/wallet-adapter-react-ui →  WalletModalButton (UI)
  └── NetworkConfig:
        commitment: "confirmed"
        endpoint:   "https://api.devnet.solana.com"
```

Only Phantom is targeted. The wallet adapter is configured to prefer Phantom via `preferredWallet`.

### 7.3 Key Hooks

| Hook              | Responsibility                                              |
|-------------------|-------------------------------------------------------------|
| `useProgram`     | Returns the Anchor `Program` instance connected to Devnet   |
| `useVote`        | Sends the `cast_vote` instruction, returns tx signature     |
| `useVoteStatus`  | Reads the PDA account to determine if wallet has voted      |
| `useProposals`   | Loads and returns `proposals.json` data                     |
| `useProposalVotes` | Calls `getProgramAccounts` to get all votes for a proposal |

### 7.4 Pages

**Home (`/`)**
- Displays grid of ProposalCards loaded from `proposals.json`
- Shows wallet connection status in header
- Each card links to `/proposal/:id`

**ProposalPage (`/proposal/:id`)**
- Loads proposal metadata by matching `id` from URL param
- Displays full proposal details
- If wallet connected:
  - Calls `useVoteStatus` → shows "Already Voted" badge or voting UI
  - Voting UI: option radio buttons + "Cast Vote" button
- If wallet not connected:
  - Shows "Connect Wallet to Vote" prompt
- After vote:
  - Shows success toast + "View Transaction" link to Solana Explorer

### 7.5 State Management

No external state library. The app uses:

1. **React Context** — provided by `@solana/wallet-adapter-react` for wallet state (public key, connected, signTransaction).
2. **Local component state** — `useState` / `useReducer` within each component.
3. **Custom hooks** — encapsulate blockchain read/write logic and cache results via `useRef` or simple module-level variables (acceptable for Devnet scale).

### 7.6 Transaction Signature UX

After a successful vote transaction:

```typescript
const explorerUrl = `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
```

This is rendered as a clickable link in the UI via the `TransactionLink` component.

---

## 8. Anchor Smart Contract — Detailed Design

### 8.1 `lib.rs` — Program Entrypoint

```rust
use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::cast_vote::*;

declare_id!("CVoice11111111111111111111111111111111111111111");

#[program]
pub mod campus_voice {
    use super::*;

    pub fn cast_vote(
        ctx: Context<CastVote>,
        proposal_id: String,
        option_value: String,
    ) -> Result<()> {
        instructions::cast_vote::handler(ctx, proposal_id, option_value)
    }
}
```

### 8.2 `instructions/cast_vote.rs`

```rust
use anchor_lang::prelude::*;
use crate::state::VoteRecord;
use crate::errors::CampusVoiceError;

#[derive(Accounts)]
#[instruction(proposal_id: String)]
pub struct CastVote<'info> {
    #[account(
        init,
        payer = voter,
        space = 200,
        seeds = [b"vote", proposal_id.as_bytes(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<CastVote>,
    proposal_id: String,
    option_value: String,
) -> Result<()> {
    require!(!proposal_id.is_empty(), CampusVoiceError::EmptyProposalId);
    require!(!option_value.is_empty(), CampusVoiceError::EmptyOptionValue);

    let vote_record = &mut ctx.accounts.vote_record;
    vote_record.wallet = ctx.accounts.voter.key();
    vote_record.proposal_id = proposal_id.clone();
    vote_record.option_value = option_value.clone();
    vote_record.voted_at = Clock::get()?.unix_timestamp;

    emit!(VoteCast {
        wallet: vote_record.wallet,
        proposal_id,
        option_value,
        voted_at: vote_record.voted_at,
    });

    Ok(())
}
```

### 8.3 Build Configuration

**`Anchor.toml`:**

```toml
[features]
seeds = false
skip-lint = false

[programs.devnet]
campus_voice = "CVoice11111111111111111111111111111111111111111"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

---

## 9. Solana Explorer Integration

Every transaction signature is linkable:

```
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

The `TransactionLink` component renders this as:

```tsx
<a href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
   target="_blank" rel="noopener noreferrer">
  View on Solana Explorer ↗
</a>
```

---

## 10. Security Considerations

| Concern                          | Mitigation                                                           |
|----------------------------------|----------------------------------------------------------------------|
| Double voting                    | PDA seeded on (proposal_id, wallet) — unique per pair; account init fails on duplicate |
| Spam / griefing                  | Voter pays rent for account creation (~0.002 SOL) — natural spam barrier |
| Proposal tampering               | Metadata is off-chain (JSON); on-chain only stores the option value string. Trust model: frontend validates option values match the JSON. |
| Malicious option values          | Frontend restricts selection to predefined options. On-chain stores whatever string the user submits (acceptable for Devnet). Production would add an on-chain allowlist. |
| Key management                   | Wallet signing is handled entirely by Phantom — no private keys in the app. |

---

## 11. Development Roadmap

### Phase 1: Scaffold & Local Setup (Day 1)

- [ ] Initialize Vite + React + TypeScript project
- [ ] Configure Tailwind CSS
- [ ] Initialize Anchor project inside the monorepo
- [ ] Create `proposals.json` with 3-5 sample proposals
- [ ] Set up folder structure for frontend and program
- [ ] Configure `Anchor.toml` for Devnet

### Phase 2: Smart Contract (Day 1-2)

- [ ] Implement `VoteRecord` account struct
- [ ] Implement `cast_vote` instruction
- [ ] Implement custom error codes
- [ ] Add `VoteCast` event emission
- [ ] Build and deploy to Devnet: `anchor build && anchor deploy`
- [ ] Record the generated Program ID and update `Anchor.toml` + frontend constants

### Phase 3: Frontend Foundation (Day 2)

- [ ] Set up WalletProvider with Solana Wallet Adapter
- [ ] Configure connection to Devnet endpoint
- [ ] Create `useProgram` hook (Anchor Program instance)
- [ ] Create `useProposals` hook (load JSON data)
- [ ] Build layout components (Header, Footer)
- [ ] Build ProposalList + ProposalCard components

### Phase 4: Voting Flow (Day 2-3)

- [ ] Build ProposalDetail page with voting UI
- [ ] Implement PDA derivation helper (`src/lib/pda.ts`)
- [ ] Implement `useVoteStatus` hook (read PDA account)
- [ ] Implement `useVote` hook (send cast_vote instruction)
- [ ] Wire up VoteButton → useVote → TransactionLink flow
- [ ] Test end-to-end: connect wallet → vote → see tx on Explorer → cannot vote again

### Phase 5: Vote Counts & Polish (Day 3)

- [ ] Implement `useProposalVotes` hook (`getProgramAccounts` + filter)
- [ ] Display vote counts per option on ProposalDetail
- [ ] Add loading states and error handling
- [ ] Add toast notifications for success/error
- [ ] Responsive design pass with Tailwind
- [ ] Empty states (no proposals, no wallet connected)

### Phase 6: Testing & Deployment (Day 3-4)

- [ ] Write Anchor integration tests (TypeScript)
- [ ] Test double-vote prevention
- [ ] Test invalid option handling
- [ ] Test voting period validation (if implemented)
- [ ] Final review of Solana Explorer links
- [ ] Deploy frontend (Vercel / Netlify / manual)
- [ ] Document deployment steps and Program ID

---

## 12. Key Dependencies

### Frontend (`package.json`)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@solana/web3.js": "^1.95.0",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@coral-xyz/anchor": "^0.30.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.0",
    "vite": "^5.4.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Anchor Program (`programs/campus_voice/Cargo.toml`)

```toml
[dependencies]
anchor-lang = "0.30.1"
```

---

## 13. Architecture Diagram (Text)

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (User)                     │
│                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Phantom   │  │ React App    │  │ proposals.json   │  │
│  │ Wallet    │  │ (Vite SPA)   │  │ (bundled/served) │  │
│  └─────┬────┘  └──────┬───────┘  └────────┬─────────┘  │
│        │              │                   │             │
│        │  sign tx     │  read metadata    │             │
│        ├──────────────┤◄──────────────────┤             │
│        │              │                   │             │
│        │  send tx     │                   │             │
└────────┼──────────────┼───────────────────┼─────────────┘
         │              │                   │
         ▼              ▼                   │
┌───────────────────────────────────────────┼─────────────┐
│           Solana Devnet RPC              │             │
│                                          │             │
│  ┌──────────────────────────┐            │             │
│  │   Campus Voice Program   │            │             │
│  │                          │            │             │
│  │  cast_vote(proposal_id,  │            │             │
│  │            option_value) │            │             │
│  └──────────┬───────────────┘            │             │
│             │                            │             │
│             ▼                            │             │
│  ┌──────────────────────┐                │             │
│  │  VoteRecord PDA      │                │             │
│  │  seeds: ["vote",     │                │             │
│  │    proposal_id,      │                │             │
│  │    wallet_pubkey]    │                │             │
│  └──────────────────────┘                │             │
│                                          │             │
│  ┌──────────────────────────┐            │             │
│  │  Solana Explorer         │◄───────────┘             │
│  │  /tx/<signature>         │                          │
│  └──────────────────────────┘                          │
└─────────────────────────────────────────────────────────┘
```

---

## 14. Open Decisions

| #  | Decision                                                         | Recommendation                           |
|----|------------------------------------------------------------------|------------------------------------------|
| 1  | Should on-chain store the option value as a string or an index?  | String — simpler, human-readable on Explorer, no need for on-chain option registry |
| 2  | Should vote counts be fetched via `getProgramAccounts` or a custom indexer? | `getProgramAccounts` for Devnet MVP |
| 3  | Should voting period be enforced on-chain?                        | Not for MVP — frontend checks `endsAt` from JSON; on-chain enforcement adds complexity |
| 4  | Should we store proposal hash on-chain for integrity?             | Not for MVP — acceptable trust model for a hackathon demo |
| 5  | Single program deployment or upgradeable?                         | Single deployment — simpler for MVP |

---

*End of Technical Design Document*
