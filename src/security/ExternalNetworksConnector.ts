import { createHmac } from "crypto";
import { v4 as uuidv4 } from "uuid";
import { logger } from "@/lib/logger";

export type ExternalNetwork = "TWITTER" | "DISCORD" | "TELEGRAM" | "INSTAGRAM" | "TIKTOK";

interface NetworkCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken?: string;
  webhookUrl?: string;
}

interface NetworkMessage {
  id: string;
  network: ExternalNetwork;
  type: "TEXT" | "IMAGE" | "VIDEO" | "ANNOUNCEMENT";
  content: string;
  mediaUrls: string[];
  timestamp: Date;
  status: "PENDING" | "SENT" | "FAILED";
  targetAudience?: string;
}

export class ExternalNetworksConnector {
  private credentials: Map<ExternalNetwork, NetworkCredentials> = new Map();
  private sentMessages: NetworkMessage[] = [];
  private readonly rateLimits: Record<ExternalNetwork, number> = {
    TWITTER: 300,
    DISCORD: 30,
    TELEGRAM: 20,
    INSTAGRAM: 200,
    TIKTOK: 100,
  };

  configure(network: ExternalNetwork, credentials: NetworkCredentials): void {
    this.credentials.set(network, credentials);
    logger.info("[NETWORKS] Red configurada", { network });
  }

  isConfigured(network: ExternalNetwork): boolean {
    return this.credentials.has(network);
  }

  async broadcast(message: Omit<NetworkMessage, "id" | "timestamp" | "status">): Promise<Record<ExternalNetwork, boolean>> {
    const results: Record<ExternalNetwork, boolean> = {
      TWITTER: false,
      DISCORD: false,
      TELEGRAM: false,
      INSTAGRAM: false,
      TIKTOK: false,
    };

    const networksToSend = Object.keys(this.credentials.keys()) as ExternalNetwork[];

    for (const network of networksToSend) {
      try {
        const success = await this.sendToNetwork(network, message);
        results[network] = success;
      } catch (error) {
        logger.error("[NETWORKS] Error enviando a", { network, error });
      }
    }

    return results;
  }

  async sendToNetwork(
    network: ExternalNetwork,
    message: Omit<NetworkMessage, "id" | "timestamp" | "status">,
  ): Promise<boolean> {
    const creds = this.credentials.get(network);
    if (!creds) {
      logger.warn("[NETWORKS] Red no configurada", { network });
      return false;
    }

    const fullMessage: NetworkMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
      status: "PENDING",
    };

    try {
      const response = await this.dispatchToNetwork(network, fullMessage, creds);
      fullMessage.status = response ? "SENT" : "FAILED";
      this.sentMessages.push(fullMessage);
      return response;
    } catch (error) {
      fullMessage.status = "FAILED";
      this.sentMessages.push(fullMessage);
      logger.error("[NETWORKS] Dispatch error", { network, error });
      return false;
    }
  }

  getSentMessages(network?: ExternalNetwork, limit = 10): NetworkMessage[] {
    let messages = this.sentMessages;
    if (network) messages = messages.filter(m => m.network === network);
    return messages.slice(-limit);
  }

  getStats(): Record<ExternalNetwork, { sent: number; failed: number; configured: boolean }> {
    const networks: ExternalNetwork[] = ["TWITTER", "DISCORD", "TELEGRAM", "INSTAGRAM", "TIKTOK"];
    const stats: Record<string, { sent: number; failed: number; configured: boolean }> = {};

    for (const network of networks) {
      const networkMessages = this.sentMessages.filter(m => m.network === network);
      stats[network] = {
        sent: networkMessages.filter(m => m.status === "SENT").length,
        failed: networkMessages.filter(m => m.status === "FAILED").length,
        configured: this.credentials.has(network),
      };
    }

    return stats as Record<ExternalNetwork, { sent: number; failed: number; configured: boolean }>;
  }

  private async dispatchToNetwork(
    network: ExternalNetwork,
    message: NetworkMessage,
    creds: NetworkCredentials,
  ): Promise<boolean> {
    const endpoints: Record<ExternalNetwork, string> = {
      TWITTER: "https://api.twitter.com/2/tweets",
      DISCORD: creds.webhookUrl || "https://discord.com/api/webhooks/placeholder",
      TELEGRAM: `https://api.telegram.org/bot${creds.apiKey}/sendMessage`,
      INSTAGRAM: "https://graph.instagram.com/v12.0/media",
      TIKTOK: "https://open-api.tiktok.com/video/upload/",
    };

    const endpoint = endpoints[network];
    if (!endpoint) return false;

    const payloads: Record<string, unknown> = {
      TWITTER: { text: message.content },
      DISCORD: { content: message.content },
      TELEGRAM: { chat_id: creds.accessToken, text: message.content },
      INSTAGRAM: { caption: message.content, media_type: "IMAGE" },
      TIKTOK: { description: message.content },
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "IsabellaVillasenor/1.0 (TAMV Network Connector)",
    };

    if (creds.accessToken) {
      headers["Authorization"] = `Bearer ${creds.accessToken}`;
    }

    const signature = createHmac("sha256", creds.apiSecret).update(JSON.stringify(payloads[network])).digest("hex");
    headers["X-TAMV-Signature"] = signature;

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payloads[network]),
      signal: AbortSignal.timeout(15000),
    });

    return response.ok;
  }
}

export const networksConnector = new ExternalNetworksConnector();
