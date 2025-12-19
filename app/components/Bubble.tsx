const Bubble = ({ message }) => {
  const isUser = message.role === "user";

  const containerCls = isUser
    ? "self-end bg-blue-500 text-white ml-8 mr-2"
    : "self-start bg-white/90 text-slate-900 mr-8 ml-2";

  return (
    <div
      key={message.id}
      className={`cute-wipe ${containerCls} max-w-[85%] px-4 py-2 rounded-2xl shadow-sm my-2`}
    >
      <div className="text-xs opacity-70 mb-1">
        <strong>{message.role}</strong>
      </div>
      <div className="text-sm">{message.content}</div>
    </div>
  );
};

export default Bubble;
