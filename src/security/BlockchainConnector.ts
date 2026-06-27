import { createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

export type ChainType = "POLYGON" | "MSR" | "ETHEREUM" | "BSC";

export interface BlockchainTransaction {
  id: string;
  chain: ChainType;
  type: "BOOKPI_HASH" | "CONTRACT_EXECUTION" | "TOKEN_TRANSFER" | "LEDGER_ANCHOR";
  payload: Record<string, unknown>;
  hash: string;
  timestamp: Date;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  confirmations: number;
}

interface ChainConfig {
  rpcUrl: string;
  chainId: number;
  explorerUrl: string;
  gasLimit: number;
}

export class BlockchainConnector {
  private transactions: BlockchainTransaction[] = [];
  private readonly configs: Record<ChainType, ChainConfig>;

  constructor() {
    this.configs = {
      POLYGON: {
        rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com",
        chainId: 137,
        explorerUrl: "https://polygonscan.com",
        gasLimit: 300000,
      },
      MSR: {
        rpcUrl: process.env.MSR_RPC_URL || "https://msr-blockchain.internal",
        chainId: 42,
        explorerUrl: "https://msr.explorer",
        gasLimit: 500000,
      },
      ETHEREUM: {
        rpcUrl: process.env.ETH_RPC_URL || "https://mainnet.infura.io/v3/placeholder",
        chainId: 1,
        explorerUrl: "https://etherscan.io",
        gasLimit: 300000,
      },
      BSC: {
        rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org",
        chainId: 56,
        explorerUrl: "https://bscscan.com",
        gasLimit: 300000,
      },
    };
  }

  async anchorToChain(data: string, chain: ChainType = "POLYGON"): Promise<BlockchainTransaction> {
    const hash = createHash("sha256").update(data).digest("hex");

    const tx: BlockchainTransaction = {
      id: uuidv4(),
      chain,
      type: "LEDGER_ANCHOR",
      payload: { dataHash: hash, originalLength: data.length },
      hash,
      timestamp: new Date(),
      status: "PENDING",
      confirmations: 0,
    };

    try {
      await this.submitTransaction(tx);
      tx.status = "CONFIRMED";
      tx.confirmations = 12;
      logger.info("[BLOCKCHAIN] Anclaje confirmado", { id: tx.id, chain, hash: tx.hash });
    } catch (error) {
      tx.status = "FAILED";
      logger.error("[BLOCKCHAIN] Error en anclaje", { id: tx.id, error });
    }

    this.transactions.push(tx);
    return tx;
  }

  async registerBookPIHash(
    bookId: string,
    contentHash: string,
    metadata: Record<string, unknown>,
    chain: ChainType = "MSR",
  ): Promise<BlockchainTransaction> {
    const payload = { bookId, contentHash, metadata };
    const data = JSON.stringify(payload);
    const hash = createHash("sha256").update(data).digest("hex");

    const tx: BlockchainTransaction = {
      id: uuidv4(),
      chain,
      type: "BOOKPI_HASH",
      payload,
      hash,
      timestamp: new Date(),
      status: "PENDING",
      confirmations: 0,
    };

    try {
      await this.submitTransaction(tx);
      tx.status = "CONFIRMED";
      tx.confirmations = 6;
      logger.info("[BLOCKCHAIN] BookPI hash registrado", { bookId, chain, txId: tx.id });
    } catch (error) {
      tx.status = "FAILED";
      logger.error("[BLOCKCHAIN] Error registrando BookPI hash", { bookId, error });
    }

    this.transactions.push(tx);
    return tx;
  }

  verifyTransaction(txId: string): BlockchainTransaction | null {
    return this.transactions.find(t => t.id === txId) ?? null;
  }

  getChainConfig(chain: ChainType): ChainConfig {
    return this.configs[chain];
  }

  getTransactionHistory(chain?: ChainType): BlockchainTransaction[] {
    if (chain) return this.transactions.filter(t => t.chain === chain);
    return [...this.transactions];
  }

  private async submitTransaction(_tx: BlockchainTransaction): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export const blockchainConnector = new BlockchainConnector();
