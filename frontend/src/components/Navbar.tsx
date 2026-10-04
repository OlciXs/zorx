import { theme } from '../themes';
import React from 'react';
import { BookOpen, LogOut } from 'lucide-react';

interface NavbarProps {
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <header style={styles.navbar}>
      <div style={styles.navBrand}>
        <BookOpen size={24} color={theme.colors.primary} />
        <span style={styles.navTitle}>Flipify</span>
      </div>
      <button onClick={onLogout} style={styles.btnLogout}>
        <LogOut size={16} /> Wyloguj się
      </button>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: theme.colors.white, borderBottom: `1px solid ${theme.colors.border}` },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navTitle: { fontSize: '18px', fontWeight: 700, color: theme.colors.text },
  btnLogout: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: `1px solid ${theme.colors.border}`, padding: '8px 12px', borderRadius: '6px', color: theme.colors.textMuted, cursor: 'pointer', fontSize: '13px' },
};