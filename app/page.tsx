"use client";

import { useChat } from "ai.matey.react.core";
// import { UIMessage } from "@ai-sdk/react";
import PromptSuggestionRow from "./components/PromptSuggestionRow";
import LoadingBubble from "./components/LoadingBubble";
import Bubble from "./components/Bubble";

export default function Home() {
  const {
    append,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
  } = useChat();
  const noMessages = !messages || messages.length === 0;

  console.log(messages);

  const handlePrompt = (promptText: string) => {
    // const msg = {
    //   id: crypto.randomUUID(),
    //   parts: [{ type: "text", text: promptText }],
    //   role: "user",
    // };
    // // ERROR HERE
    // append(msg);

    append(promptText);
  };

  return (
    <main>
      <section className={noMessages ? "" : "populated"}>
        {noMessages ? (
          <>
            <p>Chatbot</p>
            <PromptSuggestionRow onPromptClick={handlePrompt} />
          </>
        ) : (
          messages.map((message, index) => (
            <Bubble key={`message-${index}`} message={message} />
          ))
        )}

        {isLoading && <LoadingBubble />}
      </section>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={handleInputChange}
          value={input}
          placeholder="Ask me something..."
        />
        <input type="submit" />
      </form>
    </main>
  );
}
