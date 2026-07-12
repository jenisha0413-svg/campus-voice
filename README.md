# Campus Voice

A decentralized student governance platform built on Solana. Students connect their Phantom wallet and vote on campus proposals — every vote is recorded on-chain and verifiable.

## Tech Stack

- **Smart Contract**: Anchor (Solana) — stores vote records on-chain via PDAs
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Wallet**: Phantom via `@solana/wallet-adapter-react`
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Rust](https://rustup.rs/)
- [Solana CLI](https://docs.solanalabs.com/cli/install) v2.x
- [Anchor CLI](https://www.anchor-lang.com/docs/installation) v0.30.1
- [Phantom Wallet](https://phantom.app/) browser extension

## Quick Start

### 1. Start a local test validator

```bash
solana-test-validator --reset
```

### 2. Deploy the smart contract

```bash
# Configure CLI for local validator
solana config set --url localhost

# Build the program
anchor build

# Deploy
solana program deploy target/deploy/campus_voice.so
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Connect Phantom Wallet

1. Open Phantom extension
2. Click the network dropdown → select **Localhost** (or add Custom RPC: `http://localhost:8899`)
3. Click **Connect Wallet** on the site

The local test validator provides unlimited SOL for testing.

## Project Structure

```
├── programs/campus_voice/     # Anchor smart contract
│   └── src/
│       ├── lib.rs             # Entrypoint
│       ├── state.rs           # VoteRecord account struct
│       ├── errors.rs          # Custom errors
│       └── instructions/
│           └── cast_vote.rs   # Vote instruction with PDA
├── frontend/                  # React + Vite frontend
│   └── src/
│       ├── components/        # UI components (Navbar, Hero, ProposalCard, etc.)
│       ├── pages/             # Route pages (Home, ProposalPage, Results, About)
│       ├── lib/               # Solana helpers (constants, PDA derivation)
│       ├── hooks/             # Custom React hooks
│       └── data/              # Proposal metadata (JSON)
└── tests/                     # Anchor integration tests
```

## How It Works

1. A student connects their Phantom wallet
2. They browse active proposals and select Yes or No
3. The frontend builds a Solana transaction with the vote instruction
4. The smart contract creates a PDA (Program Derived Address) unique to that wallet + proposal
5. The PDA `init` constraint prevents double-voting at the protocol level
6. A tx signature is returned and can be verified on Solana Explorer

## Program ID

```
2h198Q9MNSFGWo2aJeEq2CRFSSfykfFVKUkbDJhyzrAf
```
