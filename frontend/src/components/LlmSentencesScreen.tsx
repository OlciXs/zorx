import { theme } from '../themes';
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
  const [error, setError] = useState<string | null>(null);

const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://6.tcp.eu.ngrok.io:10686/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "speakleash_bielik-11b-v3.0-instruct",
          system_prompt: "Answer with 3 distinct English sentences demonstrating the word, each on a new line. Each sentence must not be longer than 10 words. Don't add any conversational filler, only the sentences. Do not include numbers 1 2 3 before sentences",
          input: `Create 3 different creative but simple sentences that show the use of the word '${selectedWord.word}'.`
        })
      });

      if (!response.ok) {
        throw new Error(`Błąd serwera: ${response.status}`);
      }

      const data = await response.json();
      
      // Wyciągamy treść z odpowiedzi
      const content = data.output?.[0]?.content || "";
      
      // Dzielimy odpowiedź po nowej linii i oczyszczamy z ewentualnych numerków (np. "1.", "-")
      const parsedSentences = content
        .split('\n')
        .map((s: string) => s.replace(/^\d+[\.\)]\s*/, '').trim()) // Usuwa numerację typu "1. " jeśli model ją doda
        .filter((s: string) => s.length > 0);                     // Odrzuca puste linijki

      if (parsedSentences.length > 0) {
        setSentences(parsedSentences);
      } else {
        setSentences([content.trim()]);
      }

    } catch (err: any) {
      console.error("Błąd podczas generowania zdań:", err);
      setError("Nie udało się połączyć z modelem AI. Sprawdź CORS na serwerze Python.");
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
          <Bot size={32} color={theme.colors.purpleAccent} />
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

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.sentencesBox}>
          <h4 style={styles.sentTitle}>Przykładowe zdania:</h4>
          {sentences.map((sent, idx) => (
            <div key={idx} style={styles.sentenceItem}>
              <span style={{ color: theme.colors.text }}>{idx + 1}.</span>
              <strong style={{ color: theme.colors.text }}>{sent}</strong>
            </div>
          ))}
        </div>
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
  aiButton: { padding: '14px', backgroundColor: theme.colors.purpleAccent, color: theme.colors.white, border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  sentencesBox: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem', backgroundColor: theme.colors.pageBackground, padding: '1.5rem', borderRadius: '16px' },
  sentTitle: { margin: '0 0 6px 0', fontSize: '14px', color: theme.colors.textLabel },
  sentenceItem: { fontSize: '15px', color: theme.colors.text, display: 'flex', gap: '8px' },
  errorText: { color: theme.colors.danger, fontSize: '14px', margin: 0 }
};