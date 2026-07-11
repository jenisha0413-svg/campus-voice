import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { COMMITMENT, PROGRAM_ID, RPC_ENDPOINT } from "./constants";
import type { CampusVoice } from "../types/idl";

import idl from "./idl.json";

export function getProgram(provider: AnchorProvider): Program<CampusVoice> {
  return new Program<CampusVoice>(
    idl as Idl,
    new PublicKey(PROGRAM_ID),
    provider
  );
}

export { COMMITMENT, PROGRAM_ID, RPC_ENDPOINT };
