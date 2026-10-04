import { theme } from '../themes';
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, RotateCcw, Play } from 'lucide-react';
import type { Flashcard } from '../types';

interface TestScreenProps {
  flashcards: Flashcard[];
  onBack: () => void;
}

type Direction = 'pl-to-en' | 'en-to-pl';

export const TestScreen: React.FC<TestScreenProps> = ({ flashcards, onBack }) => {
  const [testPhase, setTestPhase] = useState<'config' | 'testing' | 'finished'>('config');
  
  const [questionCountInput, setQuestionCountInput] = useState<string>(
    String(Math.min(flashcards.length, 10))
  );
  const [direction, setDirection] = useState<Direction>('pl-to-en');
  
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [wrongCards, setWrongCards] = useState<Flashcard[]>([]);

  const startTest = (cardsToUse: Flashcard[]) => {
    let parsedCount = parseInt(questionCountInput, 10);
    if (isNaN(parsedCount) || parsedCount < 1) {
      parsedCount = 1;
    }
    const finalCount = Math.min(parsedCount, cardsToUse.length);

    const shuffled = [...cardsToUse].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, finalCount);

    setActiveCards(selected);
    setCurrentIndex(0);
    setUserInput('');
    setFeedback(null);
    setScore(0);
    setWrongCards([]);
    setTestPhase('testing');
  };

  const currentCard = activeCards[currentIndex];

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || feedback !== null) return;

    const targetValue = direction === 'pl-to-en' ? currentCard.word : currentCard.translation;
    const isCorrect = userInput.trim().toLowerCase() === targetValue.trim().toLowerCase();

    if (isCorrect) {
      setFeedback('correct');
      setScore((prev) => prev + 1);
    } else {
      setFeedback('incorrect');
      setWrongCards((prev) => [...prev, currentCard]);
    }
  };

  const handleNext = () => {
    setUserInput('');
    setFeedback(null);
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setTestPhase('finished');
    }
  };

  if (testPhase === 'config') {
    return (
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={18} /> Wróć do menu trybów
        </button>

        <div style={styles.cardBox}>
          <h2 style={styles.title}>Konfiguracja testu pisemnego</h2>
          <p style={styles.subtitle}>
            Dostępnych fiszek w tej kategorii: <strong>{flashcards.length}</strong>
          </p>

          <div style={styles.configGroup}>
            <label style={styles.label}>Kierunek tłumaczenia:</label>
            <div style={styles.directionRow}>
              <button
                type="button"
                onClick={() => setDirection('pl-to-en')}
                style={{
                  ...styles.directionBtn,
                  backgroundColor: direction === 'pl-to-en' ? theme.colors.primary : theme.colors.pageBackground,
                  color: direction === 'pl-to-en' ? theme.colors.white : theme.colors.textLabel,
                  borderColor: direction === 'pl-to-en' ? theme.colors.primary : theme.colors.border,
                }}
              >
                Polski → Angielski
              </button>
              <button
                type="button"
                onClick={() => setDirection('en-to-pl')}
                style={{
                  ...styles.directionBtn,
                  backgroundColor: direction === 'en-to-pl' ? theme.colors.primary : theme.colors.pageBackground,
                  color: direction === 'en-to-pl' ? theme.colors.white : theme.colors.textLabel,
                  borderColor: direction === 'en-to-pl' ? theme.colors.primary : theme.colors.border,
                }}
              >
                Angielski → Polski
              </button>
            </div>
          </div>

          <div style={styles.configGroup}>
            <label style={styles.label}>Wpisz liczbę pytań:</label>
            <div style={styles.inputRow}>
              <input
                type="number"
                min="1"
                max={flashcards.length}
                value={questionCountInput}
                onChange={(e) => setQuestionCountInput(e.target.value)}
                style={styles.numberInput}
              />
              <span style={styles.inputLimitInfo}>(maks. {flashcards.length})</span>
            </div>
          </div>

          <button onClick={() => startTest(flashcards)} style={styles.mainButton}>
            <Play size={18} /> Rozpocznij test
          </button>
        </div>
      </div>
    );
  }

  if (testPhase === 'finished') {
    return (
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={18} /> Wróć do menu trybów
        </button>

        <div style={styles.finishCard}>
          <div style={styles.finishIcon}>🎉</div>
          <h2 style={styles.title}>Test ukończony!</h2>
          <p style={styles.subtitle}>
            Twój wynik: <strong>{score}</strong> z <strong>{activeCards.length}</strong> poprawnych odpowiedzi.
          </p>

          <div style={styles.finishActions}>
            <button onClick={() => startTest(flashcards)} style={styles.mainButton}>
              <RotateCcw size={16} /> Rozwiąż nowy test
            </button>
            
            {wrongCards.length > 0 && (
              <button 
                onClick={() => startTest(wrongCards)} 
                style={{ ...styles.mainButton, backgroundColor: theme.colors.text }}
              >
                Powtórz tylko błędy ({wrongCards.length})
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const questionPrompt = direction === 'pl-to-en' ? currentCard.translation : currentCard.word;
  const expectedAnswer = direction === 'pl-to-en' ? currentCard.word : currentCard.translation;
  const badgeLabel = direction === 'pl-to-en' ? 'Przetłumacz na angielski' : 'Przetłumacz na polski';
  const placeholderText = direction === 'pl-to-en' ? 'Wpisz angielskie słowo...' : 'Wpisz polskie tłumaczenie...';

  return (
    <div style={styles.container}>
      <button onClick={() => setTestPhase('config')} style={styles.backButton}>
        <ArrowLeft size={18} /> Przerwij test
      </button>

      <div style={styles.testCard}>
        <div style={styles.testProgress}>
          Pytanie {currentIndex + 1} z {activeCards.length}
        </div>

        <div style={styles.questionBox}>
          <span style={styles.questionBadge}>{badgeLabel}</span>
          <h2 style={styles.questionText}>{questionPrompt}</h2>
        </div>

        <form onSubmit={handleCheck} style={styles.testForm}>
          <input
            type="text"
            autoFocus
            disabled={feedback !== null}
            placeholder={placeholderText}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            style={{
              ...styles.testInput,
              borderColor: feedback === 'correct' ? theme.colors.green : feedback === 'incorrect' ? theme.colors.danger : theme.colors.border,
            }}
          />

          {feedback === null ? (
            <button type="submit" disabled={!userInput.trim()} style={styles.mainButton}>
              Sprawdź odpowiedź
            </button>
          ) : (
            <div style={styles.feedbackContainer}>
              {feedback === 'correct' ? (
                <div style={{ color: theme.colors.green, display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <CheckCircle2 size={20} /> Świetnie! Poprawna odpowiedź.
                </div>
              ) : (
                <div style={{ color: theme.colors.danger, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <XCircle size={20} /> Niestety nie. Poprawna odpowiedź to:
                  </div>
                  <strong style={{ fontSize: '18px', color: theme.colors.text }}>{expectedAnswer}</strong>
                </div>
              )}
              <button type="button" onClick={handleNext} style={styles.mainButton}>
                Następne pytanie →
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', maxWidth: '800px', margin: '0 auto', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', fontFamily: 'system-ui, sans-serif', backgroundColor: theme.colors.pageBackground },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: theme.colors.textMuted, fontSize: '14px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start', padding: 0 },
  cardBox: { backgroundColor: theme.colors.white, borderRadius: '24px', border: `1px solid ${theme.colors.border}`, padding: '3rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' },
  title: { fontSize: '28px', fontWeight: 700, color: theme.colors.text, margin: '0 0 4px 0' },
  subtitle: { fontSize: '15px', color: theme.colors.textMuted, margin: 0 },
  configGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  label: { fontSize: '14px', fontWeight: 600, color: theme.colors.textLabel },
  directionRow: { display: 'flex', gap: '10px' },
  directionBtn: { flex: 1, padding: '12px', borderRadius: '12px', border: '2px solid', fontWeight: 600, fontSize: '14px', cursor: 'pointer', textAlign: 'center' },
  inputRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  numberInput: { width: '120px', padding: '12px 16px', borderRadius: '12px', border: `2px solid ${theme.colors.border}`, fontSize: '18px', fontWeight: 600, outline: 'none' },
  inputLimitInfo: { fontSize: '14px', color: theme.colors.textMuted },
  mainButton: { width: '100%', padding: '14px', backgroundColor: theme.colors.primary, color: theme.colors.white, border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' },
  
  testCard: { backgroundColor: theme.colors.white, borderRadius: '24px', border: `1px solid ${theme.colors.border}`, padding: '3rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', display: 'flex', flexDirection: 'column', gap: '2rem' },
  testProgress: { fontSize: '13px', fontWeight: 600, color: theme.colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' },
  questionBox: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center', padding: '2rem 0', backgroundColor: theme.colors.pageBackground, borderRadius: '16px' },
  questionBadge: { fontSize: '11px', textTransform: 'uppercase', backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark, padding: '4px 10px', borderRadius: '20px', fontWeight: 600 },
  questionText: { fontSize: '34px', color: theme.colors.text, margin: 0, fontWeight: 700 },
  testForm: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  testInput: { padding: '16px', borderRadius: '12px', border: `2px solid ${theme.colors.border}`, fontSize: '18px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  feedbackContainer: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', backgroundColor: theme.colors.pageBackground, borderRadius: '12px' },
  finishCard: { backgroundColor: theme.colors.white, borderRadius: '24px', border: `1px solid ${theme.colors.border}`, padding: '4rem 3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' },
  finishIcon: { fontSize: '48px' },
  finishActions: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '300px' }
};