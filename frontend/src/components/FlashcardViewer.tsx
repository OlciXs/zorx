import { theme } from '../themes';
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Trash2, RotateCw, Edit2, BookOpen, List, ArrowLeftRight } from 'lucide-react';
import type { Flashcard } from '../types';

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onDelete: (id: string) => void;
  onEdit: (flashcard: Flashcard) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards, onDelete, onEdit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [showSynonyms, setShowSynonyms] = useState(false);
  const [direction, setDirection] = useState<'en-pl' | 'pl-en'>('en-pl');

  useEffect(() => {
    if (currentIndex >= flashcards.length && flashcards.length > 0) {
      setCurrentIndex(flashcards.length - 1);
    }
  }, [flashcards.length, currentIndex]);

  useEffect(() => {
    setShowDefinition(false);
    setShowSynonyms(false);
  }, [currentIndex]);

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

  if (!currentCard || flashcards.length === 0) return null;

  const cardFrontText = currentCard.word || (currentCard as any).front || '';
  const cardBackText = currentCard.translation || (currentCard as any).back || '';
  const isPolishToEnglish = direction === 'pl-en';
  const frontText = isPolishToEnglish ? cardBackText : cardFrontText;
  const backText = isPolishToEnglish ? cardFrontText : cardBackText;
  const frontLanguage = isPolishToEnglish ? 'Polski' : 'Angielski';
  const backLanguage = isPolishToEnglish ? 'Angielski' : 'Polski';

  return (
    <div style={styles.cardContainer}>
      <div style={styles.directionBar} aria-label="Kierunek tłumaczenia">
        <span style={styles.directionLabel}>
          <ArrowLeftRight size={16} />
          Uczę się:
        </span>
        <div style={styles.directionOptions} role="group" aria-label="Wybierz kierunek tłumaczenia">
          {([
            ['en-pl', 'Angielski → Polski'],
            ['pl-en', 'Polski → Angielski'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setDirection(value);
                setIsFlipped(false);
                setShowDefinition(false);
                setShowSynonyms(false);
              }}
              aria-pressed={direction === value}
              style={{
                ...styles.directionButton,
                ...(direction === value ? styles.directionButtonActive : {}),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.flipCard} onClick={() => setIsFlipped(!isFlipped)}>
        {!isFlipped ? (
          <div style={styles.cardFront}>
            <span style={styles.badgeFront}>{frontLanguage}</span>
            <h2 style={styles.wordFront}>{frontText}</h2>
            <div style={styles.flipHintContainer}>
              <RotateCw size={14} color={theme.colors.textSubtle} />
              <span style={styles.flipHint}>Kliknij kartę, aby obrócić i zobaczyć tłumaczenie</span>
            </div>
          </div>
        ) : (
          <div style={styles.cardBack}>
            <span style={styles.badgeBack}>{backLanguage}</span>
            <h2 style={styles.wordBack}>{backText}</h2>

            <div style={styles.detailsActions}>
              {currentCard.definition && (
                <button
                  onClick={(event) => { event.stopPropagation(); setShowDefinition((visible) => !visible); }}
                  style={styles.detailButton}
                >
                  <BookOpen size={15} /> {showDefinition ? 'Ukryj opis' : 'Zobacz opis'}
                </button>
              )}
              {currentCard.synonyms && currentCard.synonyms.length > 0 && (
                <button
                  onClick={(event) => { event.stopPropagation(); setShowSynonyms((visible) => !visible); }}
                  style={styles.detailButton}
                >
                  <List size={15} /> {showSynonyms ? 'Ukryj synonimy' : 'Zobacz synonimy'}
                </button>
              )}
            </div>

            {showDefinition && currentCard.definition && (
              <div style={styles.infoBox}>
                <strong>Opis:</strong> {currentCard.definition}
              </div>
            )}

            {showSynonyms && currentCard.synonyms && currentCard.synonyms.length > 0 && (
              <div style={styles.infoBox}>
                <strong>Synonimy:</strong> {currentCard.synonyms.join(', ')}
              </div>
            )}
            
            <div style={styles.flipHintContainer}>
              <RotateCw size={14} color={theme.colors.indigoText} />
              <span style={{ ...styles.flipHint, color: theme.colors.indigoText }}>Kliknij, aby wrócić do pojęcia</span>
            </div>
          </div>
        )}
      </div>

      <div style={styles.controlsBar}>
        <button
          disabled={currentIndex === 0}
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
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
          disabled={currentIndex >= flashcards.length - 1}
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          style={{
            ...styles.btnNav,
            opacity: currentIndex >= flashcards.length - 1 ? 0.4 : 1,
            cursor: currentIndex >= flashcards.length - 1 ? 'not-allowed' : 'pointer',
          }}
        >
          Następna <ChevronRight size={18} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onEdit(currentCard); }}
          style={styles.btnEdit}
          title="Edytuj fiszkę"
        >
          <Edit2 size={18} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(currentCard.id); }}
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
  cardContainer: { 
    width: '100%', 
    maxWidth: '750px', 
    margin: '0 auto', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '1.5rem' 
  },
  directionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    backgroundColor: theme.colors.white,
    padding: '10px 14px',
    borderRadius: '14px',
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
  },
  directionLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    color: theme.colors.textLabel,
    fontSize: '13px',
    fontWeight: 600,
  },
  directionOptions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  directionButton: {
    padding: '8px 12px',
    borderRadius: '9px',
    border: `1px solid ${theme.colors.border}`,
    backgroundColor: theme.colors.surfaceMuted,
    color: theme.colors.textLabel,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
  },
  directionButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
    color: theme.colors.white,
  },
  flipCard: { 
    minHeight: '400px', 
    backgroundColor: theme.colors.white, 
    borderRadius: '24px', 
    border: `1px solid ${theme.colors.border}`, 
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
  badgeFront: { fontSize: '12px', textTransform: 'uppercase', backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textMuted, padding: '6px 14px', borderRadius: '20px', fontWeight: 600, letterSpacing: '0.5px' },
  wordFront: { fontSize: '42px', color: theme.colors.text, margin: '10px 0', fontWeight: 700, wordBreak: 'break-word', lineHeight: '1.2' },
  cardBack: { textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
  badgeBack: { fontSize: '12px', textTransform: 'uppercase', backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark, padding: '6px 14px', borderRadius: '20px', fontWeight: 600, letterSpacing: '0.5px' },
  wordBack: { fontSize: '38px', color: theme.colors.primary, margin: '10px 0', fontWeight: 700, wordBreak: 'break-word', lineHeight: '1.2' },
  infoBox: { fontSize: '14px', color: theme.colors.textLabel, backgroundColor: theme.colors.pageBackground, padding: '10px 16px', borderRadius: '10px', width: '100%', maxWidth: '500px', textAlign: 'left', border: `1px solid ${theme.colors.surfaceMuted}` },
  detailsActions: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' },
  detailButton: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', border: `1px solid ${theme.colors.border}`, borderRadius: '8px', backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark, cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
  flipHintContainer: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2rem' },
  flipHint: { fontSize: '13px', color: theme.colors.textSubtle, fontWeight: 500 },
  controlsBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: theme.colors.white, 
    padding: '12px 20px', 
    borderRadius: '14px', 
    border: `1px solid ${theme.colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
  },
  btnNav: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '10px', border: 'none', backgroundColor: theme.colors.surfaceMuted, color: theme.colors.textLabel, fontSize: '14px', fontWeight: 600, cursor: 'pointer' },
  counterText: { fontSize: '14px', color: theme.colors.textMuted, fontWeight: 400 },
  btnEdit: { padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: theme.colors.infoSoft, color: theme.colors.info, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  btnDelete: { padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
};