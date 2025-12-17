export default function PromptSuggestionButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="cute-wipe inline-block bg-white/10 hover:bg-white/20 text-sm text-white/90 px-3 py-1 rounded-full shadow-sm border border-white/10 transition transform active:scale-95"
      onClick={onClick}
    >
      {text}
    </button>
  );
}
