"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Sparkles, Send, Mic } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import { Message } from "ai";
import { usePathname } from "next/navigation";

const getInitialMessages = (pathname: string): Message[] => {
  let content = "नमस्कार! मी उद्योगसेतू AI आहे. मी तुम्हाला कोणत्या सरकारी योजनांमध्ये मदत करू शकतो?\n\n(Hello! I am the UdyogSetu AI. Which government schemes can I help you find today?)";
  
  if (pathname.includes("/grievances")) {
    content = "नमस्कार! मी उद्योगसेतू AI आहे. मी पाहतोय की तुम्ही तक्रार निवारण (Grievances) पानावर आहात. तुम्हाला नवीन तक्रार दाखल करायची आहे का जुन्या तक्रारीची स्थिती तपासायची आहे?\n\n(Hello! I see you are on the Grievances page. Do you need help filing a new complaint or tracking an existing one?)";
  } else if (pathname.includes("/schemes")) {
    content = "नमस्कार! मी पाहतोय की तुम्ही योजना (Schemes) पानावर आहात. तुमच्या व्यवसायासाठी योग्य योजना शोधण्यात मी मदत करू का?\n\n(Hello! I see you are looking at Schemes. Can I help you find the best subsidy for your business?)";
  } else if (pathname.includes("/inspections")) {
    content = "नमस्कार! व्हिडिओ तपासणी (Video Inspections) संदर्भात तुम्हाला काही अडचण आहे का?\n\n(Hello! Do you need help scheduling or joining your virtual inspection?)";
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

  const toggleVoice = () => {
    if (isListening) return;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Default to Indian English, though it handles Marathi reasonably well
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange({
        target: { value: input ? `${input} ${transcript}` : transcript }
      } as React.ChangeEvent<HTMLInputElement>);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

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
            placeholder={isListening ? "Listening..." : "Type in English or Marathi..."} 
            className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={toggleVoice} 
            className={`w-10 p-0 ${isListening ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'text-slate-500'}`}
          >
            <Mic className="w-4 h-4"/>
          </Button>
          <Button type="submit" disabled={isLoading || !input?.trim()} className="bg-blue-600 hover:bg-blue-700 w-10 p-0">
            <Send className="w-4 h-4"/>
          </Button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2">
          AI Co-pilot may occasionally generate incorrect information.
        </p>
      </div>
    </div>
  );
}
