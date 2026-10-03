// AuthForms.tsx
import React, { useState } from 'react';
import { LogIn, UserPlus, BookOpen } from 'lucide-react';

const commonStyles: Record<string, React.CSSProperties> = {
  header: { textAlign: 'center', marginBottom: '2rem' },
  iconBox: { width: '64px', height: '64px', background: '#e0e7ff', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', transform: 'rotate(-5deg)' },
  title: { fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' },
  subtitle: { fontSize: '15px', color: '#64748b', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '14px 16px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#f8fafc' },
  submitBtn: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#ffffff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 10px 20px -10px rgba(79, 70, 229, 0.5)' },
  footerBtn: { background: 'none', border: 'none', color: '#6366f1', fontSize: '14px', fontWeight: 600, cursor: 'pointer', width: '100%', marginTop: '1.5rem' }
};

export const LoginScreen = ({ onLogin, onSwitchToRegister }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <div style={commonStyles.header}>
        <div style={commonStyles.iconBox}><BookOpen size={32} color="#4f46e5" /></div>
        <h2 style={commonStyles.title}>Witaj z powrotem</h2>
        <p style={commonStyles.subtitle}>Zaloguj się, aby kontynuować naukę</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }} style={commonStyles.form}>
        <div style={commonStyles.inputGroup}>
          <label style={commonStyles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={commonStyles.input} placeholder="twoj@email.com" />
        </div>
        <div style={commonStyles.inputGroup}>
          <label style={commonStyles.label}>Hasło</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={commonStyles.input} placeholder="••••••••" />
        </div>
        <button type="submit" style={commonStyles.submitBtn}><LogIn size={20} /> Zaloguj się</button>
      </form>
      <button onClick={onSwitchToRegister} style={commonStyles.footerBtn}>Nie masz konta? Zarejestruj się</button>
    </div>
  );
};

export const RegisterScreen = ({ onRegister, onSwitchToLogin }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <div style={commonStyles.header}>
        <div style={commonStyles.iconBox}><UserPlus size={32} color="#4f46e5" /></div>
        <h2 style={commonStyles.title}>Zacznij naukę</h2>
        <p style={commonStyles.subtitle}>Stwórz darmowe konto w 10 sekund</p>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onRegister(email, password); }} style={commonStyles.form}>
        <div style={commonStyles.inputGroup}>
          <label style={commonStyles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={commonStyles.input} placeholder="twoj@email.com" />
        </div>
        <div style={commonStyles.inputGroup}>
          <label style={commonStyles.label}>Hasło</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={commonStyles.input} placeholder="••••••••" />
        </div>
        <button type="submit" style={commonStyles.submitBtn}><UserPlus size={20} /> Utwórz konto</button>
      </form>
      <button onClick={onSwitchToLogin} style={commonStyles.footerBtn}>Masz już konto? Zaloguj się</button>
    </div>
  );
};