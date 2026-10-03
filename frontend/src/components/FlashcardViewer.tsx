import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import type { Flashcard } from '../types';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onDelete: (id: string) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards, onDelete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  if (!currentCard) return null;

  return (
    <div style={styles.cardContainer}>
      {/* INTERAKTYWNA KARTA */}
      <div style={styles.flipCard} onClick={() => setIsFlipped(!isFlipped)}>
        {!isFlipped ? (
          <div style={styles.cardFront}>
            <span style={styles.badgeFront}>Słowo / Fraza</span>
            <h2 style={styles.wordFront}>{currentCard.word}</h2>
            <span style={styles.flipHint}>Kliknij kartę, aby zobaczyć tłumaczenie</span>
          </div>
        ) : (
          <div style={styles.cardBack}>
            <span style={styles.badgeBack}>Tłumaczenie</span>
            <h2 style={styles.wordBack}>{currentCard.translation}</h2>

            {currentCard.definition && (
              <div style={styles.infoBox}>
                <strong>Definicja:</strong> {currentCard.definition}
              </div>
            )}

            {currentCard.synonyms && currentCard.synonyms.length > 0 && (
              <div style={styles.infoBox}>
                <strong>Synonimy:</strong> {currentCard.synonyms.join(', ')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* PASEK NAWIGACJI POD FISZKĄ */}
      <div style={styles.controlsBar}>
        <button
          disabled={currentIndex === 0}
          onClick={handlePrev}
          style={{
            ...styles.btnNav,
            opacity: currentIndex === 0 ? 0.4 : 1,
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <ChevronLeft size={18} /> Poprzednia
        </button>

        <span style={styles.counterText}>
          {currentIndex + 1} z {flashcards.length}
        </span>

        <button
          disabled={currentIndex === flashcards.length - 1}
          onClick={handleNext}
          style={{
            ...styles.btnNav,
            opacity: currentIndex === flashcards.length - 1 ? 0.4 : 1,
            cursor: currentIndex === flashcards.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Następna <ChevronRight size={18} />
        </button>

        <button
          onClick={() => onDelete(currentCard.id)}
          style={styles.btnDelete}
          title="Usuń fiszkę"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  cardContainer: { width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  flipCard: { minHeight: '280px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', position: 'relative' },
  cardFront: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' },
  badgeFront: { fontSize: '11px', textTransform: 'uppercase', backgroundColor: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 },
  wordFront: { fontSize: '32px', color: '#0f172a', margin: 0, fontWeight: 700 },
  flipHint: { fontSize: '12px', color: '#94a3b8', marginTop: '12px' },

  cardBack: { textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  badgeBack: { fontSize: '11px', textTransform: 'uppercase', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '20px', fontWeight: 600 },
  wordBack: { fontSize: '28px', color: '#4f46e5', margin: 0, fontWeight: 700 },
  infoBox: { fontSize: '13px', color: '#334155', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', width: '100%', textAlign: 'left', border: '1px solid #f1f5f9' },

  controlsBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' },
  btnNav: { display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '13px', fontWeight: 500 },
  counterText: { fontSize: '13px', color: '#64748b', fontWeight: 500 },
  btnDelete: { padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer' },
};