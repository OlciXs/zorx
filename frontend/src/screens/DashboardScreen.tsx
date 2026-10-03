// DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Category, Flashcard } from '../types';
import { Navbar } from '../components/Navbar';
import { CategorySidebar } from '../components/CategorySidebar';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { Layers, Play, Plus, X, BookOpen } from 'lucide-react';

interface DashboardScreenProps {
  onLogout: () => void;
  onStartExercises?: (categoryId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout, onStartExercises }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  const [isAddingFlashcard, setIsAddingFlashcard] = useState(false);
  const [editingFlashcardId, setEditingFlashcardId] = useState<string | null>(null);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFlashcards(selectedCategoryId);
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Błąd pobierania kategorii', err);
    }
  };

  const fetchFlashcards = async (catId?: string) => {
    try {
      const url = catId ? `/flashcards?categoryId=${catId}` : '/flashcards';
      const res = await api.get(url);
      setFlashcards(res.data);
    } catch (err) {
      console.error('Błąd pobierania fiszek', err);
    }
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await api.post('/categories', { name });
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Błąd podczas tworzenia kategorii');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Na pewno chcesz usunąć tę kategorię i wszystkie jej fiszki?')) return;
    try {
      await api.delete(`/categories/${id}`);
      if (selectedCategoryId === id) setSelectedCategoryId('');
      fetchCategories();
      fetchFlashcards('');
    } catch (err) {
      alert('Nie udało się usunąć kategorii');
    }
  };

  const handleDeleteFlashcard = async (id: string) => {
    try {
      await api.delete(`/flashcards/${id}`);
      fetchFlashcards(selectedCategoryId);
    } catch (err) {
      alert('Nie udało się usunąć fiszki');
    }
  };

const handleAddFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    try {
      if (editingFlashcardId) {
        await api.patch(`/flashcards/${editingFlashcardId}`, {
          word: newFront,
          translation: newBack,
        });
      } else {
        await api.post('/flashcards', {
          word: newFront,
          translation: newBack,
          categoryId: selectedCategoryId || null
        });
      }
      setNewFront('');
      setNewBack('');
      setIsAddingFlashcard(false);
      setEditingFlashcardId(null);
      fetchFlashcards(selectedCategoryId);
    } catch (err: any) {
      console.error('Szczegóły błędu:', err.response?.data);
      alert(editingFlashcardId ? 'Nie udało się edytować fiszki' : 'Nie udało się dodać fiszki');
    }
  };

  const currentCategoryName = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId)?.name 
    : 'Wszystkie fiszki';

  return (
    <div style={styles.appBg}>
      <Navbar onLogout={onLogout} />

      <div style={styles.mainLayout}>
        <div style={styles.sidebarWrapper}>
          <CategorySidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={setSelectedCategoryId}
            onCreateCategory={handleCreateCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        </div>

        <main style={styles.contentArea}>
          <div style={styles.contentHeader}>
            <div>
              <h1 style={styles.contentTitle}>{currentCategoryName}</h1>
              <p style={styles.contentSubtitle}>
                Masz tutaj <strong>{flashcards.length}</strong> {flashcards.length === 1 ? 'fiszkę' : 'fiszek'} do nauki.
              </p>
            </div>
            
            <div style={styles.headerActions}>
              <button 
                onClick={() => setIsAddingFlashcard(true)} 
                style={styles.btnAdd}
              >
                <Plus size={18} /> Dodaj słówko
              </button>
              
              <button 
                onClick={() => onStartExercises && onStartExercises(selectedCategoryId)}
                disabled={flashcards.length === 0}
                style={{
                  ...styles.btnPlay, 
                  ...(flashcards.length === 0 ? styles.btnDisabled : {})
                }}
              >
                <Play size={18} fill="currentColor" /> Ćwicz teraz
              </button>
            </div>
          </div>

          {flashcards.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><Layers size={48} color="#94a3b8" /></div>
              <h2 style={styles.emptyTitle}>Ta sekcja jest jeszcze pusta</h2>
              <p style={styles.emptyDesc}>
                Dodaj pierwsze słówko klikając przycisk "Dodaj słówko" u góry, lub użyj naszej wtyczki Chrome, aby zapisywać pojęcia ze stron internetowych!
              </p>
            </div>
          ) : (
            <div style={styles.flashcardsContainer}>
              <FlashcardViewer
                flashcards={flashcards}
                onDelete={handleDeleteFlashcard}
                onEdit={(flashcard) => {
                  setEditingFlashcardId(flashcard.id);
                  setNewFront(flashcard.word || (flashcard as any).front || '');
                  setNewBack(flashcard.translation || (flashcard as any).back || '');
                  setIsAddingFlashcard(true);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {isAddingFlashcard && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitleBox}>
                <BookOpen size={20} color="#4f46e5" />
                <h3 style={styles.modalTitle}>{editingFlashcardId ? 'Edytuj fiszkę' : 'Dodaj nową fiszkę'}</h3>
              </div>
              <button onClick={() => { setIsAddingFlashcard(false); setEditingFlashcardId(null); setNewFront(''); setNewBack(''); }} style={styles.btnClose}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddFlashcard} style={styles.modalForm}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Pojęcie (Front)</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newFront} 
                  onChange={e => setNewFront(e.target.value)} 
                  placeholder="np. To implement" 
                  style={styles.input} 
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Tłumaczenie (Tył)</label>
                <textarea 
                  value={newBack} 
                  onChange={e => setNewBack(e.target.value)} 
                  placeholder="np. Wdrażać, implementować" 
                  style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} 
                />
              </div>
              <div style={styles.modalFooter}>
                <button type="button" onClick={() => { setIsAddingFlashcard(false); setEditingFlashcardId(null); setNewFront(''); setNewBack(''); }} style={styles.btnCancel}>Anuluj</button>
                <button type="submit" disabled={!newFront || !newBack} style={styles.btnSave}>{editingFlashcardId ? 'Zapisz zmiany' : 'Zapisz fiszkę'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appBg: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' },
  // Zwiększona szerokość maksymalna, żeby aplikacja ładnie rozchodziła się na dużych ekranach
  mainLayout: { display: 'flex', maxWidth: '1500px', margin: '2rem auto', gap: '2.5rem', padding: '0 2.5rem' },
  sidebarWrapper: { width: '280px', flexShrink: 0 },
  contentArea: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 },
  
  contentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '1.25rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)' },
  contentTitle: { fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' },
  contentSubtitle: { fontSize: '14px', color: '#64748b', margin: 0 },
  headerActions: { display: 'flex', gap: '12px' },
  btnAdd: { display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '10px', color: '#334155', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  btnPlay: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 22px', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', border: 'none', borderRadius: '10px', color: '#ffffff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)', transition: 'transform 0.1s' },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed', boxShadow: 'none' },

  flashcardsContainer: { width: '100%' },

  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', padding: '5rem 2rem', textAlign: 'center', border: '1px dashed #cbd5e1' },
  emptyIcon: { width: '96px', height: '96px', backgroundColor: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
  emptyTitle: { fontSize: '20px', fontWeight: 700, color: '#334155', margin: '0 0 12px 0' },
  emptyDesc: { fontSize: '15px', color: '#64748b', maxWidth: '450px', lineHeight: '1.6', margin: 0 },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '100%', maxWidth: '450px', backgroundColor: '#ffffff', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  modalTitleBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  modalTitle: { margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' },
  btnClose: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' },
  modalForm: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '12px 16px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '15px', color: '#0f172a', backgroundColor: '#ffffff', outline: 'none' }, 
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' },
  btnCancel: { padding: '10px 16px', background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' },
  btnSave: { padding: '10px 20px', background: '#4f46e5', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: '600', cursor: 'pointer' }
};