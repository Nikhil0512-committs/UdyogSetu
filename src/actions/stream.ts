"use server";

import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "9mqqvbvvtfs8";
const apiSecret = process.env.STREAM_API_SECRET || "sca69wu4g4xujacdzujxnxupeu94j2q384yeyn8qkdzqvdtxu52v476pbt3pwfsx";

export async function generateStreamToken(userId: string) {
  if (!apiKey || !apiSecret) {
    throw new Error("Stream API Key or Secret is missing");
  }

  const client = new StreamClient(apiKey, apiSecret);
  const token = client.generateUserToken({ user_id: userId, validity_in_seconds: 3600 });
  
  return token;
}

export async function ensureStreamUsers(users: { id: string; name?: string }[]) {
  if (!apiKey || !apiSecret) {
    throw new Error("Stream API Key or Secret is missing");
  }

  const client = new StreamClient(apiKey, apiSecret);
  
  // Stream expects users to be registered before they can be added to calls.
  // The 'upsertUsers' method creates them if they don't exist.
  await client.upsertUsers(
    users.map(u => ({
      id: u.id,
      name: u.name || "Unknown User",
      role: 'user'
    }))
  );
  
  return true;
}
