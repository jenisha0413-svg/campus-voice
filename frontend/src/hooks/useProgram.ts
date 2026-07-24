import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { COMMITMENT } from "../lib/constants";
import idlJson from "../lib/idl.json";

export function useProgram(): Program | null {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    return new AnchorProvider(connection, wallet as any, {
      commitment: COMMITMENT as any,
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    try {
      return new Program(idlJson as Idl, provider);
    } catch {
      return null;
    }
  }, [provider]);

  return program;
}
