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
          model: "bielik-minitron-7b-v3.0-instruct",
          system_prompt: "Answer with 3 distinct English sentences demonstrating the word, each on a new line. Each sentence must not be longer than 10 words. Don't add any conversational filler, only the sentences.",
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

        {error && <p style={styles.errorText}>{error}</p>}

        <div style={styles.sentencesBox}>
          <h4 style={styles.sentTitle}>Przykładowe zdania:</h4>
          {sentences.map((sent, idx) => (
            <div key={idx} style={styles.sentenceItem}>
              <span style={{ color: '#0f172a' }}>{idx + 1}.</span>
              <strong style={{ color: '#0f172a' }}>{sent}</strong>
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
  select: { padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', backgroundColor: '#fff', color: '#0f172a', outline: 'none' },
  aiButton: { padding: '14px', backgroundColor: '#9333ea', color: '#ffffff', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  sentencesBox: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px' },
  sentTitle: { margin: '0 0 6px 0', fontSize: '14px', color: '#334155' },
  sentenceItem: { fontSize: '15px', color: '#0f172a', display: 'flex', gap: '8px' },
  errorText: { color: '#ef4444', fontSize: '14px', margin: 0 }
};