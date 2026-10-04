import { theme } from '../themes';
import React, { useState } from 'react';
import { ArrowLeft, Edit3, Sparkles, CheckCircle } from 'lucide-react';
import type { Flashcard } from '../types';

interface LlmFillScreenProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

export const LlmFillScreen: React.FC<LlmFillScreenProps> = ({ flashcards, onBack }) => {
  const [selectedWord, setSelectedWord] = useState<Flashcard>(flashcards[0]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [sentence, setSentence] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoadingGenerate(true);
    setError(null);
    setFeedback(null);
    setUserAnswer("");
    
    try {
      const response = await fetch("http://6.tcp.eu.ngrok.io:10686/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "bielik-minitron-7b-v3.0-instruct",
            system_prompt: "Answer only with one English sentence and nothing more.",
            input: `Create a sentence using word '${selectedWord.word}' but don't write this word or its conjugated form - use '___' instead.`
        })
      });

      if (!response.ok) throw new Error("Błąd serwera");
      const data = await response.json();
      setSentence(data.output?.[0]?.content?.trim() || "Failed to generate.");
    } catch (err: any) {
      setError("Nie udało się pobrać zdania z AI.");
    } finally {
      setLoadingGenerate(false);
    }
  };

  const handleCheck = async () => {
    if (!userAnswer) return;
    setLoadingCheck(true);
    
    try {
      const response = await fetch("http://6.tcp.eu.ngrok.io:10686/api/v1/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "bielik-minitron-7b-v3.0-instruct",
          system_prompt: "Act as an English teacher. Evaluate if the user's word correctly fills the blank in the sentence. Answer exactly with one short sentence.",
          input: `Sentence with blank: '${sentence}'. User filled the blank with: '${userAnswer}'. Target word was: '${selectedWord.word}'. Is the user's answer grammatically correct and makes sense? Explain briefly in Polish. have in mind that sentences must be clear and well structured.`
        })
      });

      if (!response.ok) throw new Error("Błąd serwera");
      const data = await response.json();
      setFeedback(data.output?.[0]?.content?.trim() || "Brak odpowiedzi od AI.");
    } catch (err: any) {
      setFeedback("Błąd podczas sprawdzania odpowiedzi.");
    } finally {
      setLoadingCheck(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={onBack} style={styles.backButton}>
        <ArrowLeft size={18} /> Wróć do menu trybów
      </button>

      <div style={styles.cardBox}>
        <div style={styles.headerFlex}>
          <Edit3 size={32} color={theme.colors.fuchsia} />
          <h2 style={styles.title}>Wstaw w lukę z AI</h2>
        </div>
        <p style={styles.subtitle}>Sztuczna inteligencja wygeneruje zdanie z luką. Wstaw wybrane słówko w odpowiedniej formie.</p>

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

        <button onClick={handleGenerate} disabled={loadingGenerate} style={{...styles.aiButton, backgroundColor: theme.colors.fuchsia}}>
          <Sparkles size={18} /> {loadingGenerate ? 'Generowanie zdania...' : 'Generuj zdanie z luką'}
        </button>

        {error && <p style={styles.errorText}>{error}</p>}

        {sentence && (
          <div style={styles.actionBox}>
            <h4 style={styles.sentTitle}>Uzupełnij brakujące słowo:</h4>
            <div style={styles.sentenceItem}>
              <strong>{sentence}</strong>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <input 
                type="text" 
                value={userAnswer} 
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Wpisz słówko..."
                style={styles.input}
              />
              <button onClick={handleCheck} disabled={loadingCheck || !userAnswer} style={{...styles.aiButton, backgroundColor: theme.colors.emerald, padding: '0 20px'}}>
                {loadingCheck ? '...' : <CheckCircle size={20} />}
              </button>
            </div>

            {feedback && (
              <div style={styles.feedbackBox}>
                <strong>Ocena AI: </strong> {feedback}
              </div>
            )}
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
  actionBox: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem', backgroundColor: theme.colors.pageBackground, padding: '1.5rem', borderRadius: '16px' },
  sentTitle: { margin: '0 0 6px 0', fontSize: '14px', color: theme.colors.textLabel },
  sentenceItem: { fontSize: '18px', color: theme.colors.text, lineHeight: '1.5' },
  input: { flex: 1, padding: '12px 16px', borderRadius: '10px', border: `2px solid ${theme.colors.border}`, fontSize: '15px', outline: 'none' },
  feedbackBox: { marginTop: '1rem', padding: '12px', borderRadius: '8px', backgroundColor: theme.colors.primarySoft, color: theme.colors.indigoDeep, fontSize: '15px', borderLeft: `4px solid ${theme.colors.primaryDark}` },
  errorText: { color: theme.colors.danger, fontSize: '14px', margin: 0 }
};