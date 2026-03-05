"use server";

import * as crypto from "crypto";

export async function verifyAndDecodeToken(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("Missing JWT_SECRET environment variable");
    }

    try {
        const parts = token.split(".");
        if (parts.length !== 3) throw new Error("Invalid token format");

        const [headerB64, payloadB64, signatureB64] = parts;

        // Verify signature using the secret
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(headerB64 + "." + payloadB64)
            .digest("base64url");

        if (expectedSignature !== signatureB64) {
            throw new Error("Invalid token signature");
        }

        // Decode payload
        const payloadStr = Buffer.from(payloadB64, "base64url").toString("utf8");
        const payload = JSON.parse(payloadStr);

        return payload;
    } catch (err: any) {
        console.error("JWT Verification failed:", err);
        return null;
    }
}
