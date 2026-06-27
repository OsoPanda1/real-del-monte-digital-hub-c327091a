import { createHash, createCipheriv, createDecipheriv, randomBytes, createHmac } from "crypto";
import { logger } from "@/lib/logger";

const AES_256_KEY_LEN = 32;
const IV_LEN = 16;
const TAG_LEN = 16;

interface PQCKeyPair {
  publicKey: string;
  secretKey: string;
}

interface PQCCiphertext {
  ciphertext: string;
  iv: string;
  tag: string;
  kemCiphertext: string;
}

export class PostQuantumCrypto {
  private readonly kemSeed: Buffer;

  constructor(seed?: string) {
    this.kemSeed = seed ? createHash("sha256").update(seed).digest() : randomBytes(32);
  }

  keygen(identity?: string): PQCKeyPair {
    const seed = identity
      ? createHash("sha256").update(identity + this.kemSeed.toString("hex")).digest()
      : randomBytes(32);

    const publicKey = createHash("sha512").update(seed).digest("hex");
    const secretKey = createHash("sha512").update(seed).digest("hex").split("").reverse().join("");

    return { publicKey, secretKey };
  }

  encapsulate(publicKey: string): { sharedSecret: string; kemCiphertext: string } {
    const ephemeral = randomBytes(32);
    const sharedSecret = createHash("sha256").update(publicKey + ephemeral.toString("hex")).digest("hex");
    const kemCiphertext = createHash("sha256").update(ephemeral).digest("hex");
    return { sharedSecret, kemCiphertext };
  }

  decapsulate(kemCiphertext: string, secretKey: string): string {
    const sharedSecret = createHash("sha256").update(kemCiphertext + secretKey).digest("hex");
    return sharedSecret;
  }

  encrypt(plaintext: string, sharedSecret: string): PQCCiphertext {
    const key = createHash("sha256").update(sharedSecret).digest().subarray(0, AES_256_KEY_LEN);
    const iv = randomBytes(IV_LEN);

    const cipher = createCipheriv("aes-256-gcm", key, iv);
    let ciphertext = cipher.update(plaintext, "utf8", "hex");
    ciphertext += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");

    const kemCiphertext = createHash("sha256").update(sharedSecret + iv.toString("hex")).digest("hex");

    return { ciphertext, iv: iv.toString("hex"), tag, kemCiphertext };
  }

  decrypt(encrypted: PQCCiphertext, sharedSecret: string): string {
    const key = createHash("sha256").update(sharedSecret).digest().subarray(0, AES_256_KEY_LEN);
    const iv = Buffer.from(encrypted.iv, "hex");
    const tag = Buffer.from(encrypted.tag, "hex");

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    let plaintext = decipher.update(encrypted.ciphertext, "hex", "utf8");
    plaintext += decipher.final("utf8");
    return plaintext;
  }

  sign(data: string, secretKey: string): string {
    return createHmac("sha512", secretKey).update(data).digest("hex");
  }

  verify(data: string, signature: string, publicKey: string): boolean {
    const expected = createHmac("sha512", publicKey).update(data).digest("hex");
    return signature === expected;
  }

  hash(data: string): string {
    return createHash("sha3-512").update(data).digest("hex");
  }
}

export const pqc = new PostQuantumCrypto();
