import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export function deriveVotePda(
  proposalId: number,
  voterPublicKey: PublicKey
): [PublicKey, number] {
  const voteBytes = new TextEncoder().encode("vote");

  const idBuffer = new Uint8Array(8);
  new DataView(idBuffer.buffer).setBigUint64(0, BigInt(proposalId), true);

  return PublicKey.findProgramAddressSync(
    [
      voteBytes,
      idBuffer,
      voterPublicKey.toBuffer(),
    ],
    new PublicKey(PROGRAM_ID)
  );
}
