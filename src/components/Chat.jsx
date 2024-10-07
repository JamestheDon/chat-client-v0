import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify'; // For sanitizing HTML
import hljs from 'highlight.js'; // Import the full build
import 'highlight.js/styles/github-dark.css'; // or any other style you prefer
import './Chat.css';


// Configure marked options to use highlight.js
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false,
  langPrefix: 'hljs language-',
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
});

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

    setIsTyping(true);
    const newMessage = { role: 'user', content: message.trim() };
    setMessages(prevMessages => [...prevMessages, newMessage, { role: 'assistant', content: '', isComplete: false, isThinking: true }]);
    setMessage(''); // Clear the textarea

    try {
      const token = localStorage.getItem('token'); // Retrieve token from localStorage
      console.log('Sending message to server:', message);
      const response = await fetch(`${process.env.REACT_APP_CHAT_API_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: message })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].isThinking = false;
        return newMessages;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        
        for (const line of lines) {
          if (line.trim().startsWith('data:')) {
            const jsonStr = line.replace(/^data:/, '').trim();
            try {
              const data = JSON.parse(jsonStr);
              if (data.type === 'content') {
                console.log('Received content:', data.text);
                fullContent += data.text;
                setMessages(prevMessages => {
                  const newMessages = [...prevMessages];
                  newMessages[newMessages.length - 1].content = fullContent;
                  return newMessages;
                });
                await new Promise(resolve => setTimeout(resolve, typingSpeed));
              } else if (data.type === 'end') {
                console.log('Stream ended');
                break;
              }
            } catch (error) {
              console.error('Error parsing JSON:', error, 'Raw data:', jsonStr);
            }
          }
        }
      }

      // Mark the message as complete
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].content = fullContent;
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
      setMessages(prevMessages => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1].isThinking = false;
        newMessages[newMessages.length - 1].content = "An error occurred. Please try again.";
        return newMessages;
      });
    }
  };

  const applyHighlighting = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    tempDiv.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
    
    return tempDiv.innerHTML;
  };

  const renderMessage = (msg) => {
    if (msg.role === 'assistant') {
      console.log('Rendering assistant message:', msg);
      if (msg.isThinking) {
       // console.log('Rendering thinking spinner');
        return (
          <div className="thinking">
            <div className="spinner"></div>
          </div>
        );
      }
      try {
        const rawMarkup = marked(msg.content);
       // console.log('Marked parsing complete');
        
        const highlightedMarkup = applyHighlighting(rawMarkup);
        //console.log('Highlighting applied');
        
        return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(highlightedMarkup) }} />;
      } catch (error) {
        console.error('Error in message rendering:', error);
        return <div>{msg.content}</div>; // Fallback to rendering plain text
      }
    } else {
      return msg.content;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg, index) => (
          <div key={`${index}-${msg.isThinking}`} className={`message ${msg.role} ${msg.isThinking ? 'thinking-message' : ''}`}>
            {renderMessage(msg)}
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
