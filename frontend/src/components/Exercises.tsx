import { theme } from '../themes';
import React from 'react';
import { PenTool, Layers, ArrowLeft, Bot, Edit3, MessageSquare, Target } from 'lucide-react';
import type { Flashcard } from '../types';

interface ExercisesHubProps {
  flashcards: Flashcard[];
  categoryName: string;
  onBack: () => void;
  onSelectMode: (mode: 'test' | 'interactive' | 'llm' | 'llm-fill' | 'llm-write' | 'llm-impostor') => void;
}

export const Exercises: React.FC<ExercisesHubProps> = ({ 
  flashcards, 
  categoryName, 
  onBack, 
  onSelectMode 
}) => {
  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        <ArrowLeft size={18} /> Wróć do dashboardu
      </button>

      <div style={styles.headerBox}>
        <h1 style={styles.title}>Wybierz tryb nauki</h1>
        <p style={styles.subtitle}>
          Kategoria: <strong>{categoryName}</strong> ({flashcards.length} {flashcards.length === 1 ? 'słówko' : 'słówek'})
        </p>
      </div>

      <div style={styles.modesGrid}>
        {/* Test pisemny */}
        <div style={styles.modeCard} onClick={() => onSelectMode('test')}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark }}>
            <PenTool size={32} />
          </div>
          <h3 style={styles.modeTitle}>Test pisemny</h3>
          <p style={styles.modeDesc}>
            Wybierz liczbę pytań, rozwiązuj losowe testy i powtarzaj słówka, które poszły Ci gorzej.
          </p>
          <button style={styles.modeButton}>Rozpocznij test</button>
        </div>

        {/* Ćwiczenia interaktywne */}
        <div style={styles.modeCard} onClick={() => onSelectMode('interactive')}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.colors.skySoft, color: theme.colors.skyDark }}>
            <Layers size={32} />
          </div>
          <h3 style={styles.modeTitle}>Ćwiczenia interaktywne</h3>
          <p style={styles.modeDesc}>
            Klasyczna sesja nauki z dużymi, obracanymi fiszkami we własnym tempie.
          </p>
          <button style={{ ...styles.modeButton, backgroundColor: theme.colors.sky }}>Rozpocznij naukę</button>
        </div>

        {/* Zdania z AI */}
        <div style={styles.modeCard} onClick={() => onSelectMode('llm')}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.colors.purpleSoft, color: theme.colors.purple }}>
            <Bot size={32} />
          </div>
          <h3 style={styles.modeTitle}>Zdania z AI</h3>
          <p style={styles.modeDesc}>
            Ucz się słówek w kontekście! Sztuczna inteligencja wygeneruje dla Ciebie przykładowe zdania.
          </p>
          <button style={{ ...styles.modeButton, backgroundColor: theme.colors.purple }}>Generuj zdania</button>
        </div>

        {/* Wstaw w lukę */}
        <div style={styles.modeCard} onClick={() => onSelectMode('llm-fill')}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.colors.fuchsiaSoft, color: theme.colors.fuchsia }}>
            <Edit3 size={32} />
          </div>
          <h3 style={styles.modeTitle}>Wstaw w lukę (AI)</h3>
          <p style={styles.modeDesc}>
            AI wygeneruje zdanie z luką. Wpisz uczone słówko w odpowiedniej formie, a model to sprawdzi.
          </p>
          <button style={{ ...styles.modeButton, backgroundColor: theme.colors.fuchsia }}>Uzupełnij luki</button>
        </div>

        {/* Napisz zdanie */}
        <div style={styles.modeCard} onClick={() => onSelectMode('llm-write')}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.colors.pinkSoft, color: theme.colors.pink }}>
            <MessageSquare size={32} />
          </div>
          <h3 style={styles.modeTitle}>Napisz zdanie (AI)</h3>
          <p style={styles.modeDesc}>
            Ułóż własne zdanie z wybranym słówkiem. AI sprawdzi gramatykę i wyjaśni ewentualne błędy.
          </p>
          <button style={{ ...styles.modeButton, backgroundColor: theme.colors.pink }}>Twórz zdania</button>
        </div>

        {/* Znajdź intruza */}
        <div style={styles.modeCard} onClick={() => onSelectMode('llm-impostor')}>
          <div style={{ ...styles.iconBox, backgroundColor: theme.colors.violetSoft, color: theme.colors.violet }}>
            <Target size={32} />
          </div>
          <h3 style={styles.modeTitle}>Znajdź intruza (AI)</h3>
          <p style={styles.modeDesc}>
            AI wygeneruje synonimy słówka i intruza. Twoim zadaniem jest wytypowanie niepasującego wyrazu.
          </p>
          <button style={{ ...styles.modeButton, backgroundColor: theme.colors.violet }}>Graj z AI</button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', maxWidth: '1000px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: theme.colors.pageBackground },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: theme.colors.textMuted, fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 },
  headerBox: { textAlign: 'center', marginBottom: '1rem' },
  title: { fontSize: '32px', fontWeight: 700, color: theme.colors.text, margin: '0 0 8px 0' },
  subtitle: { fontSize: '16px', color: theme.colors.textMuted, margin: 0 },
  modesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  modeCard: { backgroundColor: theme.colors.white, borderRadius: '20px', border: `1px solid ${theme.colors.border}`, padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s' },
  iconBox: { width: '72px', height: '72px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
  modeTitle: { fontSize: '20px', fontWeight: 700, color: theme.colors.text, margin: '0 0 10px 0' },
  modeDesc: { fontSize: '14px', color: theme.colors.textMuted, lineHeight: '1.6', margin: '0 0 2rem 0' },
  modeButton: { width: '100%', padding: '12px', backgroundColor: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
};