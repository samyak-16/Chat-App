// App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

function App() {
  const [jwt, setJwt] = useState('');
  const [chatId, setChatId] = useState('');
  const [textMessage, setTextMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null); // Using ref to persist socket across renders

  const connectSocket = () => {
    if (!jwt) {
      alert('JWT token required');
      return;
    }

    // Create new socket instance
    socketRef.current = io('http://localhost:4000', {
      transports: ['websocket'],
      auth: {
        token: jwt, // will be available in socket.handshake.auth.token
      },
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Connected to socket:', socketRef.current.id);
    });

    socketRef.current.on('new_message', (msg) => {
      console.log('📥 Received message:', msg);
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Disconnected from socket');
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });
  };

  const sendMessage = async () => {
    if (!chatId || !textMessage || !jwt) {
      alert('All fields are required');
      return;
    }

    const formData = new FormData();
    formData.append('chatId', chatId);
    formData.append('textMessage', textMessage);

    try {
      const res = await axios.post(
        'http://localhost:4000/api/messages/send',
        formData,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      console.log('✅ Message sent:', res.data.message);
      setMessages((prev) => [...prev, res.data.message]);
      setTextMessage('');
    } catch (err) {
      console.error(
        '❌ Error sending message:',
        err.response?.data || err.message
      );
    }
  };
  return (
    <div style={{ padding: 20, maxWidth: 600, margin: 'auto' }}>
      <h2>🧪 Socket Chat Tester</h2>

      <input
        placeholder="JWT token"
        value={jwt}
        onChange={(e) => setJwt(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />

      <button onClick={connectSocket} style={{ marginBottom: 20 }}>
        🔌 Connect Socket
      </button>

      <input
        placeholder="Chat ID"
        value={chatId}
        onChange={(e) => setChatId(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />

      <input
        placeholder="Message"
        value={textMessage}
        onChange={(e) => setTextMessage(e.target.value)}
        style={{ width: '100%', marginBottom: 8 }}
      />

      <button onClick={sendMessage} style={{ marginBottom: 20 }}>
        📤 Send Message
      </button>

      <h3>📩 Received Messages</h3>
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          background: '#f5f5f5',
          padding: 10,
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              background: '#fff',
              marginBottom: 8,
              padding: 10,
              borderRadius: 5,
            }}
          >
            <b>From: {msg.senderId}</b>
            <p>{msg.textMessage}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
