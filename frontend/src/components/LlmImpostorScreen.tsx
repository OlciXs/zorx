import { theme } from '../themes';
import React, { useState } from 'react';
import { ArrowLeft, Target, RefreshCw } from 'lucide-react';
import type { Flashcard } from '../types';

interface LlmImpostorScreenProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export const LlmImpostorScreen: React.FC<LlmImpostorScreenProps> = ({ flashcards, onBack }) => {
  const [selectedWord, setSelectedWord] = useState<Flashcard>(flashcards[0]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{ word: string, isImpostor: boolean }[]>([]);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, message: string } | null>(null);

  const handleGenerateGame = async () => {
    setLoading(true);
    setFeedback(null);
    setOptions([]);

    try {
      const response = await fetch("http://6.tcp.eu.ngrok.io:10686/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "speakleash_bielik-11b-v3.0-instruct",
          system_prompt: "Output exactly 4 English words separated by commas and nothing else. No intro, no outro.",
          input: `Generate exactly 4 single English words separated by commas. The first 3 must be synonyms or words very closely related to '${selectedWord.word}'. The 4th MUST be a completely unrelated, random word (the impostor).`
        })
      });

      if (!response.ok) throw new Error("Błąd serwera");
      const data = await response.json();
      const content = data.output?.[0]?.content || "";
      
      const words = content.split(',').map((w: string) => w.trim().toLowerCase());
      if (words.length >= 4) {
        // AI powinno dać intruza na 4 miejscu (index 3). Tworzymy obiekty i tasujemy.
        const mappedOptions = [
          { word: words[0], isImpostor: false },
          { word: words[1], isImpostor: false },
          { word: words[2], isImpostor: false },
          { word: words[3], isImpostor: true }
        ];
        
        // Szybki shuffle (tasowanie tablicy)
        const shuffled = mappedOptions.sort(() => 0.5 - Math.random());
        setOptions(shuffled);
      }
    } catch (err: any) {
      setFeedback({ isCorrect: false, message: "Błąd podczas generowania intruzów z AI." });
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (isImpostor: boolean) => {
    if (isImpostor) {
      setFeedback({ isCorrect: true, message: "Świetnie! To słowo nie pasuje do reszty." });
    } else {
      setFeedback({ isCorrect: false, message: "Pudło! To słowo to synonim. Spróbuj jeszcze raz." });
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        <ArrowLeft size={18} /> Wróć do menu trybów
      </button>

      <div style={styles.cardBox}>
        <div style={styles.headerFlex}>
          <Target size={32} color={theme.colors.violet} />
          <h2 style={styles.title}>Znajdź intruza (Impostor)</h2>
        </div>
        <p style={styles.subtitle}>Znajdź słowo, które <strong>nie jest</strong> synonimem i nie pasuje do "{selectedWord.word}".</p>

        <div style={styles.selectorGroup}>
          <label style={styles.label}>Wybierz słówko bazowe:</label>
          <select 
            value={selectedWord.id} 
            onChange={(e) => setSelectedWord(flashcards.find(f => f.id === e.target.value)!)}
            style={styles.select}
          >
            {flashcards.map(f => (
              <option key={f.id} value={f.id}>{f.word} — {f.translation}</option>
            ))}
          </select>
        </div>

        <button onClick={handleGenerateGame} disabled={loading} style={{...styles.aiButton, backgroundColor: theme.colors.violet}}>
          <RefreshCw size={18} /> {loading ? 'Losowanie słów...' : 'Generuj planszę'}
        </button>

        {options.length > 0 && (
          <div style={styles.gameGrid}>
            {options.map((opt, idx) => (
              <button 
                key={idx} 
                onClick={() => handleOptionClick(opt.isImpostor)}
                style={styles.wordCard}
              >
                {opt.word}
              </button>
            ))}
          </div>
        )}

        {feedback && (
          <div style={{...styles.feedbackBox, backgroundColor: feedback.isCorrect ? theme.colors.greenSoft : theme.colors.redSoft, color: feedback.isCorrect ? theme.colors.greenDark : theme.colors.redDark, borderLeftColor: feedback.isCorrect ? theme.colors.emeraldDark : theme.colors.red}}>
            <strong>{feedback.isCorrect ? 'Gratulacje!' : 'Błąd:'}</strong> {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: theme.colors.pageBackground },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: theme.colors.textMuted, fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 },
  cardBox: { backgroundColor: theme.colors.white, borderRadius: '24px', border: `1px solid ${theme.colors.border}`, padding: '3rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  headerFlex: { display: 'flex', alignItems: 'center', gap: '12px' },
  title: { fontSize: '24px', fontWeight: 700, color: theme.colors.text, margin: 0 },
  subtitle: { fontSize: '14px', color: theme.colors.textMuted, margin: 0 },
  selectorGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '1rem' },
  label: { fontSize: '13px', fontWeight: 600, color: theme.colors.textBody, textTransform: 'uppercase' },
  select: { padding: '12px 16px', borderRadius: '10px', border: `2px solid ${theme.colors.border}`, fontSize: '15px', backgroundColor: theme.colors.white, color: theme.colors.text, outline: 'none' },
  aiButton: { padding: '14px', color: theme.colors.white, border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  gameGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' },
  wordCard: { padding: '24px', backgroundColor: theme.colors.pageBackground, border: `2px solid ${theme.colors.border}`, borderRadius: '16px', fontSize: '18px', fontWeight: 600, color: theme.colors.textStrong, cursor: 'pointer', transition: '0.2s' },
  feedbackBox: { marginTop: '1rem', padding: '16px', borderRadius: '12px', fontSize: '16px', borderLeft: '4px solid' }
};