import React, { useState } from 'react';
import { api } from '../api';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

interface AuthScreenProps {
  onLoginSuccess: (token: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await api.post('/users/login', { email, password });
      const authToken = res.data.accessToken || res.data.token || res.data.access_token;

      if (authToken) {
        localStorage.setItem('token', authToken);
        onLoginSuccess(authToken);
      } else {
        alert('Zalogowano, ale backend nie przekazał tokena JWT.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(', ') : msg || 'Błąd logowania');
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await api.post('/users/register', { email, password });
      alert('Konto zostało utworzone! Teraz możesz się zalogować.');
      setIsRegistering(false);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(', ') : msg || 'Błąd rejestracji');
    }
  };

  return (
    <div style={styles.authBg}>
      {isRegistering ? (
        <RegisterScreen
          onRegister={handleRegister}
          onSwitchToLogin={() => setIsRegistering(false)}
        />
      ) : (
        <LoginScreen
          onLogin={handleLogin}
          onSwitchToRegister={() => setIsRegistering(true)}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  authBg: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f1f5f9',
  },
};