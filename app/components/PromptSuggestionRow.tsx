import PromptSuggestionButton from "./PromptSuggestionButton";

type Props = {
  onPromptClick: (prompt: string) => void;
};

const PromptSuggestionRow = ({ onPromptClick }: Props) => {
  const prompts = [
    "What is Xue App?",
    "Can you explain what Xue App is?",
    "How do I learn Chinese fast?",
    "How do I count from 1 to 10 in Chinese?",
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
