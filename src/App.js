import React, { useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Chat from './components/Chat';
import { Menu } from 'lucide-react'; // Import Menu from lucide-react

function App() {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="App">
      {!token ? (
        <div className="auth-container">
          {isRegistering ? (
            <>
              <RegisterForm setToken={setToken} />
              <button onClick={() => setIsRegistering(false)}>Back to Login</button>
            </>
          ) : (
            <>
              <LoginForm setToken={setToken} />
              <button onClick={() => setIsRegistering(true)}>Register</button>
            </>
          )}
        </div>
      ) : (
        <div className={`chat-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="sidebar-container">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <div className="sidebar">
              <h2>Sidebar</h2>
              <p>This is the sidebar content.</p>
            </div>
          </div>
          <div className="chat-main">
            <Chat token={token} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
