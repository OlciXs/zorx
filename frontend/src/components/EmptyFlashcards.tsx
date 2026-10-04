import { theme } from '../themes';
import React from 'react';
import { Sparkles } from 'lucide-react';

export const EmptyFlashcards: React.FC = () => {
  return (
    <div style={styles.emptyCard}>
      <Sparkles size={40} color={theme.colors.slateIcon} style={{ marginBottom: '12px' }} />
      <h3 style={{ margin: '0 0 8px 0', color: theme.colors.textStrong }}>Brak fiszek</h3>
      <p style={{ margin: 0, color: theme.colors.textMuted, fontSize: '14px' }}>
        Nie masz jeszcze żadnych fiszek w tej kategorii. Dodaj nowe słówka używając wtyczki Chrome!
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  emptyCard: { width: '100%', maxWidth: '480px', backgroundColor: theme.colors.white, border: `2px dashed ${theme.colors.borderStrong}`, borderRadius: '16px', padding: '3rem', textAlign: 'center' },
};