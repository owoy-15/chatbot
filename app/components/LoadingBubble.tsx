const LoadingBubble = () => {
  return (
    <div className="flex items-center gap-3 mt-4 cute-wipe">
      <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin" />
      <div className="text-sm text-white/80">Thinking...</div>
    </div>
  );
};

export default LoadingBubble;
