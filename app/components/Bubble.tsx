const Bubble = ({ message }) => {
  console.log(message);

  return <div className={message.role}>{message.content}</div>;
};

export default Bubble;
