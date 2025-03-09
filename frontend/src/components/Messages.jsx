import React from 'react';

const Messages = ({ messages }) => {
  return (
    <section>
      <h3>Messages</h3>
      <div className="list-group">
        {messages.map((message, index) => (
          <div className="list-group-item" key={index}>
            <h5>{message.subject}</h5>
            <p>{message.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Messages;
