import React, { useState } from 'react';
import './App.css';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Chat from './components/Chat';

function App() {
  const [token, setToken] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        {!token ? (
          isRegistering ? (
            <>
              <RegisterForm setToken={setToken} />
              <button onClick={() => setIsRegistering(false)}>Back to Login</button>
            </>
          ) : (
            <>
              <LoginForm setToken={setToken} />
              <button onClick={() => setIsRegistering(true)}>Register</button>
            </>
          )
        ) : (
          <Chat token={token} />
        )}
      </header>
    </div>
  );
}

export default App;
