"use client";

import { useChat } from "ai.matey.react.core";
// import { UIMessage } from "@ai-sdk/react";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";
import { useEffect } from "react";

export default function Home() {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat({ api: "/api/chat" });

  const noMessages = !messages || messages.length === 0;

  useEffect(() => {
    messages.forEach((m) => console.log(m.role, m.content));
  }, [messages]);

  const handlePrompt = (promptText: string) => {
    append(promptText);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 text-white p-6 flex flex-col items-center">
      <section
        className={`w-full max-w-2xl bg-[rgba(255,255,255,0.03)] rounded-2xl p-5 flex flex-col ${
          noMessages ? "items-center justify-center" : "items-stretch"
        }`}
      >
        {noMessages ? (
          <>
            <p className="text-2xl font-semibold">F1 GPT Chat</p>
            <p className="text-sm text-white/70 mt-2">
              Try a prompt or ask something about Formula 1.
            </p>
            <PromptSuggestionRow onPromptClick={handlePrompt} />
          </>
        ) : (
          <div className="flex flex-col">
            {messages.map((message, index) => (
              <Bubble key={`message-${index}`} message={message} />
            ))}
            {isLoading && <LoadingBubble />}
          </div>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mt-4 flex gap-2 items-center"
      >
        <input
          type="text"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
          className="flex-1 rounded-full px-4 py-2 bg-white/6 placeholder:text-white/50 text-white outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          type="submit"
          className="ml-2 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-full text-white font-medium transition"
        >
          Send
        </button>
      </form>

      {/* Cute wipe animation + small tweaks */}
      <style jsx global>{`
        .cute-wipe {
          transform-origin: left;
          animation: cute-wipe 360ms cubic-bezier(0.2, 0.9, 0.2, 1);
        }
        @keyframes cute-wipe {
          0% {
            transform: scaleX(0);
            opacity: 0;
          }
          60% {
            transform: scaleX(1.05);
            opacity: 1;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
    </main>
  );
}
