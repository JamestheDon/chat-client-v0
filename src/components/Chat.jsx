import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chat.css';
import axios from 'axios';  // Add this import

function Chat({ token }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatContainerRef = useRef(null);
  const typingSpeed = 50; // milliseconds per character

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && !isTyping) {
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
    if (!message.trim()) return;

    const newMessage = { role: 'user', content: message.trim() };
    setMessages(prevMessages => [...prevMessages, newMessage, { role: 'assistant', content: '', isComplete: false, isThinking: true }]);
    setMessage('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      console.log('Sending message to server:', message);
      const response = await axios({
        method: 'post',
        url: `${process.env.REACT_APP_CHAT_API_URL}`,
        data: { content: message },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'text',
      });

      const lines = response.data.split('\n');
      let fullContent = '';
      
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].isThinking = false;
        return newMessages;
      });

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6).trim(); // Remove 'data: ' prefix and trim
          console.log('Received content:', content);
          if (content === '[END]') {
            break; // Stop processing when we reach the end marker
          }
          await new Promise(resolve => setTimeout(resolve, typingSpeed));
          fullContent += (fullContent ? ' ' : '') + content;
          setMessages(prevMessages => {
            const newMessages = [...prevMessages];
            newMessages[newMessages.length - 1].content = fullContent;
            return newMessages;
          });
        }
      }

      // Mark the message as complete
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].isComplete = true;
        return newMessages;
      });

      setIsTyping(false);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle unauthorized access or token expiration
      if (error.response && error.response.status === 401) {
        // Redirect to login or refresh token
        console.log('Unauthorized access. Please log in again.');
      }
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.role === 'assistant' ? (
              msg.isThinking ? (
                <div className="thinking">
                  <div className="spinner"></div>
                </div>
              ) : msg.isComplete ? (
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              ) : (
                <div className="typing-effect">{msg.content}</div>
              )
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
            disabled={isTyping}
          />
          <button type="submit" className="send-button" aria-label="Send message" disabled={isTyping}>
            <Send size={20} color="#007bff" style={{backgroundColor: 'transparent'}} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
