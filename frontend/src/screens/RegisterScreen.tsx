import { theme } from '../themes';
import React, { useState } from 'react';
import { UserPlus, BookOpen } from 'lucide-react';

interface RegisterScreenProps {
  onRegister: (email: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(email, password);
  };

  return (
    <div style={styles.authCard}>
      <div style={styles.authHeader}>
        <div style={styles.iconCircle}>
          <BookOpen size={28} color={theme.colors.primary} />
        </div>
        <h2 style={styles.authTitle}>Stwórz konto</h2>
        <p style={styles.authSubtitle}>Zarejestruj się, aby zapisywać fiszki i kategorie</p>
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
          <UserPlus size={18} /> Utwórz konto
        </button>
      </form>

      <div style={styles.authFooter}>
        <button onClick={onSwitchToLogin} style={styles.btnToggle}>
          Masz już konto? Zaloguj się
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  authCard: { backgroundColor: theme.colors.white, padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' },
  authHeader: { textAlign: 'center', marginBottom: '1.5rem' },
  iconCircle: { width: '56px', height: '56px', backgroundColor: theme.colors.primarySoft, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' },
  authTitle: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: theme.colors.text },
  authSubtitle: { margin: 0, fontSize: '13px', color: theme.colors.textMuted },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', fontWeight: 600, color: theme.colors.textLabel },
  input: { padding: '10px 14px', borderRadius: '8px', border: `1px solid ${theme.colors.borderStrong}`, fontSize: '14px', outline: 'none' },
  btnSubmit: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: theme.colors.primary, color: theme.colors.white, fontWeight: 600, cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
  authFooter: { marginTop: '1.5rem', textAlign: 'center' },
  btnToggle: { background: 'none', border: 'none', color: theme.colors.primary, fontSize: '13px', fontWeight: 500, cursor: 'pointer' },
};