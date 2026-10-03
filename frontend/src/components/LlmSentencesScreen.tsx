import React, { useState } from 'react';
import { ArrowLeft, Bot, Sparkles } from 'lucide-react';
import type { Flashcard } from '../types';

interface LlmSentencesScreenProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export const LlmSentencesScreen: React.FC<LlmSentencesScreenProps> = ({ flashcards, onBack }) => {
  const [selectedWord, setSelectedWord] = useState<Flashcard>(flashcards[0]);
  const [loading, setLoading] = useState(false);
  const [sentences, setSentences] = useState<string[]>([
    "This is an example sentence generated for your word.",
    "Another contextual sentence demonstrating usage."
  ]);

  const handleGenerate = async () => {
    setLoading(true);
    // TODO: Tutaj podłączysz zapytanie do swojego backendu z LLM (np. api.post('/ai/sentences', { word: selectedWord.word }))
    setTimeout(() => {
      setSentences([
        `I need to ${selectedWord.word} as soon as possible.`,
        `Can you show me how to ${selectedWord.word} effectively?`
      ]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        <ArrowLeft size={18} /> Wróć do menu trybów
      </button>

      <div style={styles.cardBox}>
        <div style={styles.headerFlex}>
          <Bot size={32} color="#9333ea" />
          <h2 style={styles.title}>Kontekstowe zdania z AI</h2>
        </div>
        <p style={styles.subtitle}>Wybierz słówko i zobacz, jak sztuczna inteligencja używa go w zdaniach.</p>

        <div style={styles.selectorGroup}>
          <label style={styles.label}>Wybierz słówko:</label>
          <select 
            value={selectedWord.id} 
            onChange={(e) => {
              const found = flashcards.find(f => f.id === e.target.value);
              if (found) setSelectedWord(found);
            }}
            style={styles.select}
          >
            {flashcards.map(f => (
              <option key={f.id} value={f.id}>{f.word} — {f.translation}</option>
            ))}
          </select>
        </div>

        <button onClick={handleGenerate} disabled={loading} style={styles.aiButton}>
          <Sparkles size={18} /> {loading ? 'Generowanie...' : 'Generuj nowe zdania'}
        </button>

        <div style={styles.sentencesBox}>
          <h4 style={styles.sentTitle}>Przykładowe zdania:</h4>
          {sentences.map((sent, idx) => (
            <div key={idx} style={styles.sentenceItem}>
              <span>{idx + 1}.</span> <strong>{sent}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { maxWidth: '800px', margin: '3rem auto', padding: '0 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'system-ui, sans-serif' },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#64748b', fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 },
  cardBox: { backgroundColor: '#ffffff', borderRadius: '24px', border: '1px solid #e2e8f0', padding: '3rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  headerFlex: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 },
  subtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  selectorGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '1rem' },
  label: { fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase' },
  select: { padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', backgroundColor: '#fff', outline: 'none' },
  aiButton: { padding: '14px', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  sentencesBox: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px' },
  sentTitle: { margin: '0 0 6px 0', fontSize: '14px', color: '#334155' },
  sentenceItem: { fontSize: '15px', color: '#0f172a', display: 'flex', gap: '8px' }
};