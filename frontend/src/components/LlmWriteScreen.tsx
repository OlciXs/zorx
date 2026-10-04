import { theme } from '../themes';
import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import type { Flashcard } from '../types';

interface LlmWriteScreenProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export const LlmWriteScreen: React.FC<LlmWriteScreenProps> = ({ flashcards, onBack }) => {
  const [selectedWord, setSelectedWord] = useState<Flashcard>(flashcards[0]);
  const [userSentence, setUserSentence] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleCheckSentence = async () => {
    if (!userSentence.trim()) return;
    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("http://6.tcp.eu.ngrok.io:10686/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "speakleash_bielik-11b-v3.0-instruct",
          system_prompt: "Act as a strict but encouraging English teacher. Answer in Polish with exactly one or two sentences. No useless words. Focus on keyword and grammar.",
          input: `The user was tasked to write a sentence using the English word '${selectedWord.word} or it's conjugated form'. They wrote: '${userSentence}'. Check precisely if the grammar is correct and if the word was used properly. Tell them what is wrong or praise them if it's correct. Be careful to not make any mistakes and answer in Polish.`
        })
      });

      if (!response.ok) throw new Error("Błąd serwera");
      const data = await response.json();
      setFeedback(data.output?.[0]?.content?.trim() || "Brak odpowiedzi.");
    } catch (err: any) {
      setFeedback("Błąd podczas łączenia z AI. Sprawdź serwer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        <ArrowLeft size={18} /> Wróć do menu trybów
      </button>

      <div style={styles.cardBox}>
        <div style={styles.headerFlex}>
          <MessageSquare size={32} color={theme.colors.pink} />
          <h2 style={styles.title}>Napisz własne zdanie</h2>
        </div>
        <p style={styles.subtitle}>Ułóż zdanie po angielsku z wybranym słówkiem, a AI sprawdzi poprawność gramatyczną.</p>

        <div style={styles.selectorGroup}>
          <label style={styles.label}>Wybierz słówko:</label>
          <select 
            value={selectedWord.id} 
            onChange={(e) => {
              const found = flashcards.find(f => f.id === e.target.value);
              if (found) setSelectedWord(found);
              setFeedback(null);
            }}
            style={styles.select}
          >
            {flashcards.map(f => (
              <option key={f.id} value={f.id}>{f.word} — {f.translation}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <label style={styles.label}>Twoje zdanie:</label>
          <textarea 
            value={userSentence} 
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder={`Wpisz zdanie ze słówkiem "${selectedWord.word}"...`}
            style={styles.textarea}
            rows={3}
          />
        </div>

        <button onClick={handleCheckSentence} disabled={loading || !userSentence.trim()} style={{...styles.aiButton, backgroundColor: theme.colors.pink}}>
          <Send size={18} /> {loading ? 'Sprawdzanie...' : 'Sprawdź moje zdanie'}
        </button>

        {feedback && (
          <div style={styles.feedbackBox}>
            <strong>AI Nauczyciel: </strong> {feedback}
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
  textarea: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: `2px solid ${theme.colors.border}`, fontSize: '15px', outline: 'none', resize: 'vertical', marginTop: '6px' },
  aiButton: { padding: '14px', color: theme.colors.white, border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  feedbackBox: { marginTop: '1rem', padding: '16px', borderRadius: '12px', backgroundColor: theme.colors.pinkSurface, color: theme.colors.pinkDark, fontSize: '16px', borderLeft: `4px solid ${theme.colors.pink}` }
};