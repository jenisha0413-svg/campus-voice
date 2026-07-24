import { Program, Idl, AnchorProvider } from "@coral-xyz/anchor";
import { COMMITMENT, PROGRAM_ID, RPC_ENDPOINT } from "./constants";
import idlJson from "./idl.json";

const idl = idlJson as Idl;

export function getProgram(provider: AnchorProvider): Program {
  return new Program(idl, provider);
}

export { COMMITMENT, PROGRAM_ID, RPC_ENDPOINT };
