import type { Idl } from "@coral-xyz/anchor";

export type CampusVoice = Idl;

export const idl: CampusVoice = {
  version: "0.1.0",
  name: "campus_voice",
  instructions: [
    {
      name: "castVote",
      accounts: [
        {
          name: "voteRecord",
          isMut: true,
          isSigner: false,
        },
        {
          name: "voter",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "proposalId",
          type: "u64",
        },
        {
          name: "vote",
          type: "bool",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "VoteRecord",
      type: {
        kind: "struct",
        fields: [
          {
            name: "wallet",
            type: "publicKey",
          },
          {
            name: "proposalId",
            type: "u64",
          },
          {
            name: "vote",
            type: "bool",
          },
          {
            name: "votedAt",
            type: "i64",
          },
        ],
      },
    },
  ],
  events: [
    {
      name: "VoteCast",
      fields: [
        {
          name: "wallet",
          type: "publicKey",
          index: false,
        },
        {
          name: "proposalId",
          type: "u64",
          index: false,
        },
        {
          name: "vote",
          type: "bool",
          index: false,
        },
        {
          name: "votedAt",
          type: "i64",
          index: false,
        },
      ],
    },
  ],
  errors: [
    {
      code: 6000,
      name: "AlreadyVoted",
      msg: "You have already voted on this proposal.",
    },
    {
      code: 6001,
      name: "VotingEnded",
      msg: "Proposal voting period has ended.",
    },
    {
      code: 6002,
      name: "VotingNotStarted",
      msg: "Proposal voting period has not started.",
    },
  ],
};
