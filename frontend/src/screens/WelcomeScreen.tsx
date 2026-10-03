// WelcomeScreen.tsx
import React, { useState } from 'react';
import { api } from '../api';
import { LoginScreen, RegisterScreen } from '../AuthForms';
import { Download, Puzzle, Zap } from 'lucide-react';

interface WelcomeScreenProps {
  onLoginSuccess: (token: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginSuccess }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await api.post('/users/login', { email, password });
      const authToken = res.data.accessToken || res.data.token || res.data.access_token;
      if (authToken) {
        localStorage.setItem('token', authToken);
        onLoginSuccess(authToken);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(', ') : msg || 'Błąd logowania');
    }
  };

  const handleRegister = async (email: string, password: string) => {
    try {
      await api.post('/users/register', { email, password });
      alert('Konto zostało utworzone! Możesz się teraz zalogować.');
      setIsRegistering(false);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(', ') : msg || 'Błąd rejestracji');
    }
  };

  return (
    <div style={styles.container}>
      {/* Lewa strona - Promocja wtyczki */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.logoBadge}>
            <Zap size={24} color="#6366f1" />
            <span style={{ fontWeight: 800, fontSize: '24px', color: '#1e293b' }}>Flipify</span>
          </div>
          
          <h1 style={styles.headline}>Ucz się słówek <br/><span style={styles.highlight}>szybciej i mądrzej.</span></h1>
          <p style={styles.subheadline}>
            Zapisuj nowe pojęcia bezpośrednio ze stron internetowych za pomocą naszej wtyczki i powtarzaj je w nowoczesnym panelu.
          </p>

          <div style={styles.downloadCard}>
            <div style={styles.downloadHeader}>
              <Puzzle size={20} color="#4f46e5" />
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Pobierz wtyczkę</h3>
            </div>
            <p style={{ margin: '8px 0 16px', fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
              1. Wypakuj plik ZIP.<br/>
              2. Otwórz <code>chrome://extensions/</code><br/>
              3. Włącz "Tryb dewelopera" i załaduj rozpakowany folder.
            </p>
            <a href="/Flipify.zip" download style={styles.downloadBtn}>
              <Download size={18} /> Pobierz Flipify.zip
            </a>
          </div>
        </div>
      </div>

      {/* Prawa strona - Autoryzacja */}
      <div style={styles.authSection}>
        <div style={styles.authWrapper}>
          {isRegistering ? (
            <RegisterScreen onRegister={handleRegister} onSwitchToLogin={() => setIsRegistering(false)} />
          ) : (
            <LoginScreen onLogin={handleLogin} onSwitchToRegister={() => setIsRegistering(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  heroSection: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundImage: 'radial-gradient(circle at top left, #e0e7ff 0%, #f8fafc 100%)' },
  heroContent: { maxWidth: '480px' },
  logoBadge: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem' },
  headline: { fontSize: '42px', fontWeight: 800, color: '#0f172a', lineHeight: '1.2', margin: '0 0 1rem 0' },
  highlight: { background: 'linear-gradient(135deg, #4f46e5, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subheadline: { fontSize: '16px', color: '#475569', marginBottom: '2.5rem', lineHeight: '1.6' },
  downloadCard: { background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.8)', padding: '24px', borderRadius: '20px', boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.15)' },
  downloadHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  downloadBtn: { display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0f172a', color: '#fff', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '14px', transition: 'transform 0.2s' },
  authSection: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: '#ffffff', boxShadow: '-20px 0 40px -10px rgba(0,0,0,0.02)' },
  authWrapper: { width: '100%', maxWidth: '400px' }
};