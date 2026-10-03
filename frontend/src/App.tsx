import { useState } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { DashboardScreen } from './screens/DashboardScreen';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Jeśli użytkownik nie jest zalogowany, pokazujemy ekran powitalny z logowaniem/rejestracją
  if (!token) {
    return <WelcomeScreen onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  // Jeśli ma token, wpuszczamy go do panelu z fiszkami
  return <DashboardScreen onLogout={handleLogout} />;
}