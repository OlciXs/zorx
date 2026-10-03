import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Trash2, RotateCw } from 'lucide-react';
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

  // Wsparcie dla różnych wariantów nazw pól w typie Flashcard (front/word oraz back/translation)
  const cardFrontText = currentCard.word || (currentCard as any).word || '';
  const cardBackText = currentCard.translation || (currentCard as any).translation || '';

  return (
    <div style={styles.cardContainer}>
      {/* DUŻA INTERAKTYWNA KARTA NA ŚRODKU */}
      <div style={styles.flipCard} onClick={() => setIsFlipped(!isFlipped)}>
        {!isFlipped ? (
          <div style={styles.cardFront}>
            <span style={styles.badgeFront}>Pojęcie / Słowo</span>
            <h2 style={styles.wordFront}>{cardFrontText}</h2>
            <div style={styles.flipHintContainer}>
              <RotateCw size={14} color="#94a3b8" />
              <span style={styles.flipHint}>Kliknij kartę, aby obrócić i zobaczyć tłumaczenie</span>
            </div>
          </div>
        ) : (
          <div style={styles.cardBack}>
            <span style={styles.badgeBack}>Tłumaczenie</span>
            <h2 style={styles.wordBack}>{cardBackText}</h2>

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
            
            <div style={styles.flipHintContainer}>
              <RotateCw size={14} color="#818cf8" />
              <span style={{ ...styles.flipHint, color: '#818cf8' }}>Kliknij, aby wrócić do pojęcia</span>
            </div>
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
          Fiszka <strong>{currentIndex + 1}</strong> z <strong>{flashcards.length}</strong>
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
  // Kontener na całą szerokość sekcji głównej, ładnie wyśrodkowany o maksymalnej szerokości 750px
  cardContainer: { 
    width: '100%', 
    maxWidth: '750px', 
    margin: '0 auto', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem' 
  },
  
  // Duża, spektakularna karta z miękkimi cieniami i dużymi zaokrągleniami
  flipCard: { 
    minHeight: '400px', 
    backgroundColor: '#ffffff', 
    borderRadius: '24px', 
    border: '1px solid #e2e8f0', 
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.02)', 
    padding: '3.5rem 3rem', 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center', 
    cursor: 'pointer', 
    position: 'relative',
    transition: 'transform 0.15s ease, boxShadow 0.15s ease'
  },
  
  cardFront: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', width: '100%' },
  badgeFront: { fontSize: '12px', textTransform: 'uppercase', backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, letterSpacing: '0.5px' },
  wordFront: { fontSize: '42px', color: '#0f172a', margin: '10px 0', fontWeight: 700, wordBreak: 'break-word', lineHeight: '1.2' },
  
  cardBack: { textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  badgeBack: { fontSize: '12px', textTransform: 'uppercase', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '6px 14px', borderRadius: '20px', fontWeight: 600, letterSpacing: '0.5px' },
  wordBack: { fontSize: '38px', color: '#4f46e5', margin: '10px 0', fontWeight: 700, wordBreak: 'break-word', lineHeight: '1.2' },
  
  infoBox: { fontSize: '14px', color: '#334155', backgroundColor: '#f8fafc', padding: '10px 16px', borderRadius: '10px', width: '100%', maxWidth: '500px', textAlign: 'left', border: '1px solid #f1f5f9' },

  flipHintContainer: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2rem' },
  flipHint: { fontSize: '13px', color: '#94a3b8', fontWeight: 500 },

  // Nowoczesny dolny pasek nawigacyjny dopasowany do stylów dashboardu
  controlsBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#ffffff', 
    padding: '12px 20px', 
    borderRadius: '14px', 
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
  },
  btnNav: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '14px', fontWeight: 600, transition: 'background 0.2s' },
  counterText: { fontSize: '14px', color: '#64748b', fontWeight: 400 },
  btnDelete: { padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};