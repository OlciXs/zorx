// DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Category, Flashcard } from '../types';
import { Navbar } from '../components/Navbar';
import { CategorySidebar } from '../components/CategorySidebar';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { Layers } from 'lucide-react';

interface DashboardScreenProps {
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onLogout }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

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
    if (!window.confirm('Na pewno chcesz usunąć tę kategorię i jej fiszki?')) return;
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
            onDeleteCategory={handleDeleteCategory} // Dodana funkcja usuwania! Upewnij się, że komponent ją przyjmuje.
          />
        </div>

        <main style={styles.contentArea}>
          {flashcards.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}><Layers size={48} color="#94a3b8" /></div>
              <h2 style={styles.emptyTitle}>Brak fiszek w tej sekcji</h2>
              <p style={styles.emptyDesc}>
                Wybierz inną kategorię z menu po lewej lub użyj naszej wtyczki Chrome, 
                aby zacząć zapisywać nowe słówka ze stron internetowych!
              </p>
            </div>
          ) : (
            <FlashcardViewer
              flashcards={flashcards}
              onDelete={handleDeleteFlashcard}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appBg: { minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' },
  mainLayout: { display: 'flex', maxWidth: '1280px', margin: '2rem auto', gap: '2.5rem', padding: '0 2rem' },
  sidebarWrapper: { width: '280px', flexShrink: 0 },
  contentArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, backgroundColor: '#ffffff', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)', border: '1px dashed #cbd5e1' },
  emptyIcon: { width: '96px', height: '96px', backgroundColor: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' },
  emptyTitle: { fontSize: '20px', fontWeight: 700, color: '#334155', margin: '0 0 12px 0' },
  emptyDesc: { fontSize: '15px', color: '#64748b', maxWidth: '400px', lineHeight: '1.6', margin: 0 }
};