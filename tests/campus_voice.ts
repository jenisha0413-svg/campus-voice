import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

// This is a placeholder test file.
// Update the import path once the program is built and IDL is generated.
// import { CampusVoice } from "../target/types/campus_voice";

describe("campus_voice", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Uncomment once program is built:
  // const program = anchor.workspace.CampusVoice as Program<CampusVoice>;

  const voter = provider.wallet;

  it("Cast a vote", async () => {
    // TODO: Implement after anchor build
    // const proposalId = "proposal-001";
    // const optionValue = "yes-extend";
    //
    // const [pda] = PublicKey.findProgramAddressSync(
    //   [Buffer.from("vote"), Buffer.from(proposalId), voter.publicKey.toBuffer()],
    //   program.programId
    // );
    //
    // await program.methods
    //   .castVote(proposalId, optionValue)
    //   .accounts({
    //     voteRecord: pda,
    //     voter: voter.publicKey,
    //     systemProgram: anchor.web3.SystemProgram.programId,
    //   })
    //   .rpc();
    //
    // const account = await program.account.voteRecord.fetch(pda);
    // expect(account.wallet.toString()).to.equal(voter.publicKey.toString());
    // expect(account.proposalId).to.equal(proposalId);
    // expect(account.optionValue).to.equal(optionValue);
    console.log("Test placeholder — run anchor build first");
  });

  it("Rejects duplicate vote", async () => {
    // TODO: Implement after anchor build
    console.log("Test placeholder — run anchor build first");
  });
});
