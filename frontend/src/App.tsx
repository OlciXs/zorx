import { useState } from 'react';
import { theme } from './themes';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { Exercises } from './components/Exercises';
import { TestScreen } from './components/TestScreen';
import { LlmSentencesScreen } from './components/LlmSentencesScreen';
import { LlmFillScreen } from './components/LlmFillScreen';
import { LlmWriteScreen } from './components/LlmWriteScreen';
import { LlmImpostorScreen } from './components/LlmImpostorScreen';
import { FlashcardViewer } from './components/FlashcardViewer';
import { api } from './api';
import type { Flashcard, Category } from './types';
import { BookOpen, X } from 'lucide-react';

type AppView = 'dashboard' | 'exercises-hub' | 'test' | 'interactive' | 'llm' | 'llm-fill' | 'llm-write' | 'llm-impostor';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  
  const [exerciseFlashcards, setExerciseFlashcards] = useState<Flashcard[]>([]);
  const [exerciseCategoryName, setExerciseCategoryName] = useState<string>('Wszystkie fiszki');
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');

  const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentView('dashboard');
  };

  const handleStartExercises = async (categoryId: string) => {
    try {
      setCurrentCategoryId(categoryId);
      const url = categoryId ? `/flashcards?categoryId=${categoryId}` : '/flashcards';
      const res = await api.get(url);
      setExerciseFlashcards(res.data);

      if (categoryId) {
        const catRes = await api.get('/categories');
        const found = catRes.data.find((c: Category) => c.id === categoryId);
        setExerciseCategoryName(found ? found.name : 'Wybrana kategoria');
      } else {
        setExerciseCategoryName('Wszystkie fiszki');
      }

      setCurrentView('exercises-hub');
    } catch (err) {
      console.error('Błąd pobierania fiszek do ćwiczeń', err);
      alert('Nie udało się uruchomić ćwiczeń.');
    }
  };

  const handleSaveEditedFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim() || !editingFlashcardId) return;

    try {
      await api.patch(`/flashcards/${editingFlashcardId}`, {
        word: newFront,
        translation: newBack,
      });

      const url = currentCategoryId ? `/flashcards?categoryId=${currentCategoryId}` : '/flashcards';
      const res = await api.get(url);
      setExerciseFlashcards(res.data);

      setIsEditingModalOpen(false);
      setEditingFlashcardId(null);
      setNewFront('');
      setNewBack('');
    } catch (err) {
      console.error('Nie udało się edytować fiszki', err);
      alert('Wystąpił błąd podczas edycji fiszki.');
    }
  };

  if (!token) {
    return (
      <WelcomeScreen
        onLoginSuccess={(newToken) => setToken(newToken)}
      />
    );
  }

  if (currentView === 'exercises-hub') {
    return (
      <Exercises
        flashcards={exerciseFlashcards}
        categoryName={exerciseCategoryName}
        onBack={() => setCurrentView('dashboard')}
        onSelectMode={(mode: string) => {
          if (mode === 'test' || mode === 'write') setCurrentView('test');
          else if (mode === 'interactive' || mode === 'flashcards') setCurrentView('interactive');
          else if (mode === 'llm' || mode === 'ai') setCurrentView('llm');
          else if (mode === 'llm-fill') setCurrentView('llm-fill');
          else if (mode === 'llm-write') setCurrentView('llm-write');
          else if (mode === 'llm-impostor') setCurrentView('llm-impostor');
        }}
      />
    );
  }

  if (currentView === 'test') {
    return (
      <TestScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

  if (currentView === 'interactive') {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem', position: 'relative' }}>
        <button 
          onClick={() => setCurrentView('exercises-hub')} 
          style={{ background: 'none', border: 'none', color: theme.colors.textMuted, fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          ← Wróć do menu trybów
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: theme.colors.text, marginBottom: '1.5rem' }}>
          Tryb interaktywny ({exerciseCategoryName})
        </h2>
        
        <FlashcardViewer 
          flashcards={exerciseFlashcards} 
          onDelete={async (id) => {
            try {
              await api.delete(`/flashcards/${id}`);
              setExerciseFlashcards(prev => prev.filter(f => f.id !== id));
            } catch (err) {
              console.error('Nie udało się usunąć fiszki', err);
              alert('Wystąpił błąd podczas usuwania fiszki.');
            }
          }}
          onEdit={(flashcard) => {
            setEditingFlashcardId(flashcard.id);
            setNewFront(flashcard.word || (flashcard as any).front || '');
            setNewBack(flashcard.translation || (flashcard as any).back || '');
            setIsEditingModalOpen(true);
          }}
        />

        {isEditingModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <div style={styles.modalTitleBox}>
                  <BookOpen size={20} color={theme.colors.primary} />
                  <h3 style={styles.modalTitle}>Edytuj fiszkę</h3>
                </div>
                <button onClick={() => setIsEditingModalOpen(false)} style={styles.btnClose}>
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveEditedFlashcard} style={styles.modalForm}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Pojęcie (Front)</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newFront} 
                    onChange={e => setNewFront(e.target.value)} 
                    style={styles.input} 
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Tłumaczenie (Tył)</label>
                  <textarea 
                    value={newBack} 
                    onChange={e => setNewBack(e.target.value)} 
                    style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} 
                  />
                </div>
                <div style={styles.modalFooter}>
                  <button type="button" onClick={() => setIsEditingModalOpen(false)} style={styles.btnCancel}>Anuluj</button>
                  <button type="submit" disabled={!newFront || !newBack} style={styles.btnSave}>Zapisz zmiany</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'llm') {
    return (
      <LlmSentencesScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

  if (currentView === 'llm-fill') {
    return (
      <LlmFillScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

  if (currentView === 'llm-write') {
    return (
      <LlmWriteScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

  if (currentView === 'llm-impostor') {
    return (
      <LlmImpostorScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

  return (
    <DashboardScreen 
      onLogout={handleLogout} 
      onStartExercises={handleStartExercises} 
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: '450px', backgroundColor: theme.colors.white, borderRadius: '20px', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  modalTitleBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: 700, color: theme.colors.text },
  btnClose: { background: 'none', border: 'none', color: theme.colors.textSubtle, cursor: 'pointer', padding: '4px' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: theme.colors.textBody, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '12px 16px', borderRadius: '10px', border: `2px solid ${theme.colors.border}`, fontSize: '15px', color: theme.colors.text, backgroundColor: theme.colors.white, outline: 'none' }, 
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' },
  btnCancel: { padding: '10px 16px', background: 'transparent', border: 'none', color: theme.colors.textMuted, fontWeight: '600', cursor: 'pointer' },
  btnSave: { padding: '10px 20px', background: theme.colors.primary, border: 'none', borderRadius: '10px', color: theme.colors.white, fontWeight: '600', cursor: 'pointer' }
};