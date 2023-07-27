import React from 'react';


const Message = ({ message, isOwnMessage }) => {
  return (
    <div>
      <div>{message.user.name}</div>
      <div>{message.created_at}</div>
      <div>{message.content}</div>
    </div>
  );
};

export default Message;
