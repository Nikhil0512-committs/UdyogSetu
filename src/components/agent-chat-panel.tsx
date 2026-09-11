"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles, Send, Mic, MicOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Message } from "ai";
import { usePathname } from "next/navigation";

const getInitialMessages = (pathname: string): Message[] => {
  let content = "Hello! I am the UdyogSetu AI. Which government schemes can I help you find today?";
  
  if (pathname.includes("/grievances")) {
    content = "Hello! I see you are on the Grievances page. Do you need help filing a new complaint or tracking an existing one?";
  } else if (pathname.includes("/schemes")) {
    content = "Hello! I see you are looking at Schemes. Can I help you find the best subsidy for your business?";
  } else if (pathname.includes("/inspections")) {
    content = "Hello! Do you need help scheduling or joining your virtual inspection?";
  }

  return [
    { 
      id: "1", 
      role: "assistant", 
      content 
    }
  ];
};

export function AgentChatPanel() {
  const pathname = usePathname();

  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    id: "agent-chat-session",
    api: "/api/chat",
    initialMessages: getInitialMessages(pathname),
    body: {
      pathname
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
const [isListening, setIsListening] = useState(false);
const [voiceLang, setVoiceLang] = useState<"en" | "mr">("en");
const [voiceError, setVoiceError] = useState<string | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const recognitionRef = useRef<any>(null);
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const clearVoiceTimeout = () => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }
};

// Keep the mic's language in sync with the site's EN/Marathi toggle
useEffect(() => {
  const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
  if (match && match[1] && match[1].includes("/mr")) {
    setVoiceLang("mr");
  } else {
    setVoiceLang("en");
  }
}, []);

// Load from sessionStorage on mount
useEffect(() => {
  try {
    const saved = sessionStorage.getItem("udyogsetu-chat-messages");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        setMessages(parsed);
      }
    }
  } catch (e) {
    console.error("Failed to restore chat", e);
  }
}, [setMessages]);

// Save to sessionStorage when messages change
useEffect(() => {
  if (messages.length > 0) {
    sessionStorage.setItem("udyogsetu-chat-messages", JSON.stringify(messages));
  }
}, [messages]);

useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }
}, [messages, isLoading]);

const startRecognition = (lang: "en-IN" | "en-US" | "mr-IN", isRetry = false) => {
  // @ts-expect-error - Web Speech API typing is not fully supported in standard TS config
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    setVoiceError("Voice input isn't supported in this browser. Try Chrome or Edge.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => {
    setIsListening(true);
    // Watchdog: Chrome sometimes fires onstart and then silently never
    // calls onresult/onerror/onend if the recognition pipe breaks.
    // If that happens, auto-retry once on a broader locale (en-US),
    // which is more reliably supported than en-IN/mr-IN.
    timeoutRef.current = setTimeout(() => {
      try { recognition.stop(); } catch {}
      if (!isRetry && lang !== "en-US") {
        startRecognition("en-US", true);
      } else {
        setIsListening(false);
        setVoiceError("Didn't get a response from the recognizer. Try again, or type instead.");
      }
    }, 6000);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    clearVoiceTimeout();
    const transcript = event.results[0][0].transcript;
    handleInputChange({
      target: { value: input ? `${input} ${transcript}` : transcript }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    clearVoiceTimeout();
    // Retry once on en-US before giving up, same as the timeout path.
    if (!isRetry && lang !== "en-US" && event.error !== "not-allowed") {
      try { recognition.stop(); } catch {}
      startRecognition("en-US", true);
      return;
    }
    setIsListening(false);
    const messages: Record<string, string> = {
      "not-allowed": "Microphone access was blocked. Allow it in your browser's site settings.",
      "no-speech": "Didn't catch that - try again.",
      "audio-capture": "No microphone was found.",
      network: "Voice recognition needs an internet connection.",
      language_not_supported: voiceLang === "mr"
        ? "Marathi voice input isn't supported in this browser. Try Chrome on Android/desktop, or type instead."
        : "Voice input isn't supported in this browser.",
    };
    setVoiceError(messages[event.error] ?? "Voice input failed. Please try again or type instead.");
  };

  recognition.onend = () => {
    clearVoiceTimeout();
    setIsListening(false);
  };

  recognitionRef.current = recognition;
  try {
    recognition.start();
  } catch {
    setIsListening(false);
    setVoiceError("Couldn't start voice input. Please try again.");
  }
};

const toggleVoice = () => {
  setVoiceError(null);

  if (isListening) {
    clearVoiceTimeout();
    recognitionRef.current?.stop();
    return;
  }

  startRecognition(voiceLang === "mr" ? "mr-IN" : "en-IN");
};

// Stop any in-flight recognition session if the panel unmounts mid-listen.
useEffect(() => {
  return () => {
    clearVoiceTimeout();
    recognitionRef.current?.stop();
  };
}, []);
  const initialMsgs = getInitialMessages(pathname);
  const displayMessages = messages.length > 0 ? messages : initialMsgs;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Chat History */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {displayMessages.map((m) => (
          <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-600"/>
              </div>
            )}
            
            <div className={`p-3 rounded-lg max-w-[85%] text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border border-slate-200 shadow-sm rounded-bl-none text-slate-800'
            }`}>
              {m.role === 'assistant' ? (
                <div className="prose prose-sm prose-slate max-w-none">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600"/>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm rounded-bl-none text-slate-500 text-sm flex items-center gap-2">
              <Sparkles className="w-3 h-3 animate-pulse text-blue-500"/> AI is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={input} 
            onChange={handleInputChange} 
            placeholder={isListening ? (voiceLang === "mr" ? "ऐकत आहे..." : "Listening...") : "Type in English or Marathi..."} 
            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={toggleVoice}
            title={`Voice input (${voiceLang === "mr" ? "Marathi" : "English"}) - click again to stop`}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            className={`w-10 p-0 relative ${isListening ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'text-slate-500'}`}
          >
            {isListening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
            <span className="absolute -bottom-1 -right-1 text-[8px] font-bold bg-slate-200 text-slate-600 rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
              {voiceLang === "mr" ? "मर" : "EN"}
            </span>
          </Button>
          <Button type="submit" disabled={isLoading || !input?.trim()} className="bg-blue-600 hover:bg-blue-700 w-10 p-0">
            <Send className="w-4 h-4"/>
          </Button>
        </form>
        {voiceError && (
          <p className="text-[11px] text-center text-red-500 mt-2">{voiceError}</p>
        )}
        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI Co-pilot may occasionally generate incorrect information.
        </p>
      </div>
    </div>
  );
}
