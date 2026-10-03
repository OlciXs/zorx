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
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
              <EmptyFlashcards />
              
              {/* Sekcja pobierania wtyczki Flipify */}
              <div style={styles.downloadBox}>
                <h3 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '18px' }}>
                  📥 Pobierz wtyczkę Flipify do Chrome
                </h3>
                <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '14px' }}>
                  Zapisuj słówka bezpośrednio podczas przeglądania stron internetowych!
                </p>

                <a 
                  href="/Flipify.zip" 
                  download 
                  style={styles.downloadBtn}
                >
                  Pobierz plik ZIP wtyczki
                </a>

                <div style={styles.instructionBox}>
                  <strong style={{ display: 'block', marginBottom: '6px', color: '#334155' }}>
                    Jak zainstalować wtyczkę?
                  </strong>
                  <ol style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '13px', lineHeight: '1.5' }}>
                    <li>Rozpakuj pobrany plik <code style={styles.code}>Flipify.zip</code> na swoim komputerze.</li>
                    <li>Otwórz Google Chrome i wpisz w pasku adresu: <code style={styles.code}>chrome://extensions/</code></li>
                    <li>Włącz <b>Tryb dewelopera</b> (suwak w prawym górnym rogu).</li>
                    <li>Kliknij <b>Załaduj rozpakowane</b> (w lewym górnym rogu) i wybierz wypakowany folder.</li>
                  </ol>
                </div>
              </div>
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
  appBg: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  mainLayout: { display: 'flex', maxWidth: '1100px', margin: '2rem auto', gap: '2rem', padding: '0 1rem' },
  contentArea: { flex: 1, display: 'flex', justifyContent: 'center' },
  downloadBox: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
  downloadBtn: {
    display: 'inline-block',
    background: '#2563eb',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
  },
  instructionBox: {
    background: '#f1f5f9',
    borderRadius: '8px',
    padding: '14px',
    textAlign: 'left',
  },
  code: {
    background: '#e2e8f0',
    padding: '2px 4px',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
};