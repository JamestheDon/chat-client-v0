import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

function Chat({ token }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const sendMessage = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_CHAT_API_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: message }),
      });
      const data = await res.json();
      if (res.ok) {
        // Update chat history with user message and AI response
        setChatHistory(prevHistory => [
          ...prevHistory,
          { type: 'user', content: message },
          { type: 'ai', content: data.content }
        ]);
        setMessage(''); // Clear input after sending
        setResponse(data.content);
      } else {
        alert('Failed to send message: ' + data.detail);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while sending the message');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.type === 'ai' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={handleSendMessage}>
        <div className="textarea-wrapper">
          <TextareaAutosize
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            minRows={1}
            maxRows={5}
          />
          <button type="submit" className="send-button" aria-label="Send message">
            <Send size={20} color="#007bff" style={{backgroundColor: 'transparent'}} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
