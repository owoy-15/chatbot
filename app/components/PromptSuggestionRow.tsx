import PromptSuggestionButton from "./PromptSuggestionButton";

type Props = {
  onPromptClick: (prompt: string) => void;
};

const PromptSuggestionRow = ({ onPromptClick }: Props) => {
  const prompts = [
    "Who is head of racing for Aston Martin's F1 Academy team?",
    "Who is the highest paid F1 driver?",
    "Who will be the newest driver for Ferrari?",
    "Who is the current Formula One World Driver's Champion?",
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {prompts.map((prompt, index) => (
        <PromptSuggestionButton
          key={index}
          text={prompt}
          onClick={() => onPromptClick(prompt)}
        />
      ))}
    </div>
  );
};

export default PromptSuggestionRow;
