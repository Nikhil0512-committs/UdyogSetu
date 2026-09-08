"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

export function TestChat() {
  const chat = useChat();
  useEffect(() => {
    console.log("USE_CHAT_KEYS_LOGGER_TAG", Object.keys(chat));
  }, []);
  return null;
}
