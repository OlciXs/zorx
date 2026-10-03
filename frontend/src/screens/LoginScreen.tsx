import React, { useState } from 'react';
import { LogIn, BookOpen } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div style={styles.authCard}>
      <div style={styles.authHeader}>
        <div style={styles.iconCircle}>
          <BookOpen size={28} color="#4f46e5" />
        </div>
        <h2 style={styles.authTitle}>Witaj z powrotem</h2>
        <p style={styles.authSubtitle}>Zaloguj się do swojego panelu nauki</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Adres Email</label>
          <input
            type="email"
            placeholder="twoj@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Hasło</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.btnSubmit}>
          <LogIn size={18} /> Zaloguj się
        </button>
      </form>

      <div style={styles.authFooter}>
        <button onClick={onSwitchToRegister} style={styles.btnToggle}>
          Nie masz jeszcze konta? Zarejestruj się
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  authCard: { backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' },
  authHeader: { textAlign: 'center', marginBottom: '1.5rem' },
  iconCircle: { width: '56px', height: '56px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' },
  authTitle: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: '#0f172a' },
  authSubtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#334155' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  btnSubmit: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
  authFooter: { marginTop: '1.5rem', textAlign: 'center' },
  btnToggle: { background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
};