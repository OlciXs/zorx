import React from 'react';
import { PenTool, Layers, ArrowLeft, Bot } from 'lucide-react';
import type { Flashcard } from '../types';

interface ExercisesHubProps {
  flashcards: Flashcard[];
  categoryName: string;
  onBack: () => void;
  onSelectMode: (mode: 'test' | 'interactive' | 'llm') => void;
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
        {/* Kafel 1: Test pisemny (Fioletowy motyw) */}
        <div style={styles.modeCard} onClick={() => onSelectMode('test')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#e0e7ff', color: '#4338ca' }}>
            <PenTool size={32} />
          </div>
          <h3 style={styles.modeTitle}>Test pisemny</h3>
          <p style={styles.modeDesc}>
            Wybierz liczbę pytań, rozwiązuj losowe testy i powtarzaj słówka, które poszły Ci gorzej.
          </p>
          <button style={styles.modeButton}>Rozpocznij test</button>
        </div>

        {/* Kafel 2: Ćwiczenia interaktywne / Fiszki (Fioletowy motyw) */}
        <div style={styles.modeCard} onClick={() => onSelectMode('interactive')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#ede9fe', color: '#6d28d9' }}>
            <Layers size={32} />
          </div>
          <h3 style={styles.modeTitle}>Ćwiczenia interaktywne</h3>
          <p style={styles.modeDesc}>
            Klasyczna sesja nauki z dużymi, obracanymi fiszkami we własnym tempie.
          </p>
          <button style={styles.modeButton}>Rozpocznij naukę</button>
        </div>

        {/* Kafel 3: Zdania z LLM (AI) */}
        <div style={styles.modeCard} onClick={() => onSelectMode('llm')}>
          <div style={{ ...styles.iconBox, backgroundColor: '#fae8ff', color: '#a21caf' }}>
            <Bot size={32} />
          </div>
          <h3 style={styles.modeTitle}>Zdania z AI (LLM)</h3>
          <p style={styles.modeDesc}>
            Ucz się słówek w kontekście! Sztuczna inteligencja wygeneruje dla Ciebie przykładowe zdania.
          </p>
          <button style={{ ...styles.modeButton, backgroundColor: '#9333ea' }}>Generuj zdania</button>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '1000px', margin: '3rem auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'system-ui, sans-serif' },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 },
  headerBox: { textAlign: 'center', marginBottom: '1rem' },
  title: { fontSize: '32px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' },
  subtitle: { fontSize: '16px', color: '#64748b', margin: 0 },
  modesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' },
  modeCard: { backgroundColor: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.03)', transition: 'transform 0.2s' },
  iconBox: { width: '72px', height: '72px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
  modeTitle: { fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' },
  modeDesc: { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 2rem 0' },
  modeButton: { width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }
};