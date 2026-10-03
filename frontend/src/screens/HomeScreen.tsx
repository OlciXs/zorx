import React, { useState, useEffect } from 'react';
import { api } from '../api';
import type { Category, Flashcard } from '../types';
import { Navbar } from '../components/Navbar';
import { CategorySidebar } from '../components/CategorySidebar';
import { FlashcardViewer } from '../components/FlashcardViewer';
import { EmptyFlashcards } from '../components/EmptyFlashcards';

interface HomeScreenProps {
  onLogout: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onLogout }) => {
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
        <CategorySidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          onCreateCategory={handleCreateCategory}
        />

        <main style={styles.contentArea}>
          {flashcards.length === 0 ? (
            <EmptyFlashcards />
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
  appBg: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  mainLayout: { display: 'flex', maxWidth: '1100px', margin: '2rem auto', gap: '2rem', padding: '0 1rem' },
  contentArea: { flex: 1, display: 'flex', justifyContent: 'center' },
};