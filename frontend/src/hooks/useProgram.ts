import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { useMemo } from "react";
import { COMMITMENT } from "../lib/constants";
import { getProgram } from "../lib/anchor";
import type { CampusVoice } from "../types/idl";
import { Program } from "@coral-xyz/anchor";

export function useProgram(): Program<CampusVoice> | null {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null;
    return new AnchorProvider(connection, wallet as never, {
      commitment: COMMITMENT,
    });
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    try {
      return getProgram(provider);
    } catch {
      return null;
    }
  }, [provider]);

  return program;
}
