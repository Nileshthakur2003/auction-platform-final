import React, { useState, useEffect } from 'react';
import './styles/message.css'; // Make sure to create this CSS file for styling

const PopupMessage = ({ message, duration }) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => prev - 100 / (duration / 1000));
    }, 1000);

    const timer = setTimeout(() => {
      setVisible(false);
      clearInterval(interval);
    }, duration);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [duration]);

  return (
    visible && (
      <div className="message-container">
        <div className="message">{message}</div>
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
    )
  );
};

export default PopupMessage;
