import React, { useState } from 'react';

function Chat({ token }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const sendMessage = async () => {
    try {
      const response = await fetch('http://localhost:8000/chat/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content: message }),
      });
      const data = await response.json();
      if (response.ok) {
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
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter your message"
      />
      <button onClick={sendMessage}>Send</button>
      {response && <p>Response: {response}</p>}
    </div>
  );
}

export default Chat;
