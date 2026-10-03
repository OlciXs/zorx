import { useState } from 'react';
import { WelcomeScreen } from './screens/WelcomeScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { Exercises } from './components/Exercises';
import { TestScreen } from './components/TestScreen';
import { LlmSentencesScreen } from './components/LlmSentencesScreen';
import { FlashcardViewer } from './components/FlashcardViewer'; // Jeśli masz go w komponentach
import { api } from './api';
import type { Flashcard, Category } from './types';

// Rozszerzone stany widoków aplikacji
type AppView = 'dashboard' | 'exercises-hub' | 'test' | 'interactive' | 'llm';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  
  const [exerciseFlashcards, setExerciseFlashcards] = useState<Flashcard[]>([]);
  const [exerciseCategoryName, setExerciseCategoryName] = useState<string>('Wszystkie fiszki');

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentView('dashboard');
  };

  // Uruchomienie sekcji ćwiczeń z poziomu Dashboardu (przycisk "Ćwicz teraz")
  const handleStartExercises = async (categoryId: string) => {
    try {
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

  // Jeśli użytkownik nie jest zalogowany
  if (!token) {
    return <WelcomeScreen onLoginSuccess={(newToken) => setToken(newToken)} />;
  }

  // 1. Ekran główny wyboru trybów (Hub)
  if (currentView === 'exercises-hub') {
    return (
      <Exercises
        flashcards={exerciseFlashcards}
        categoryName={exerciseCategoryName}
        onBack={() => setCurrentView('dashboard')}
        onSelectMode={(mode) => setCurrentView(mode)}
      />
    );
  }

  // 2. Zaawansowany test pisemny (z wyborem pytań i powtórką błędów)
  if (currentView === 'test') {
    return (
      <TestScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

// 3. Tryb interaktywny (Fiszki / FlashcardViewer)
  if (currentView === 'interactive') {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 2rem' }}>
        <button 
          onClick={() => setCurrentView('exercises-hub')} 
          style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem' }}
        >
          ← Wróć do menu trybów
        </button>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem' }}>
          Tryb interaktywny ({exerciseCategoryName})
        </h2>
        
        <FlashcardViewer 
          flashcards={exerciseFlashcards} 
          onDelete={async (id) => {
            try {
              // Opcjonalnie: wywołanie API do usunięcia z bazy danych
              await api.delete(`/flashcards/${id}`);
              
              // Usunięcie fiszki z lokalnego stanu, aby widok od razu się zaktualizował
              setExerciseFlashcards(prev => prev.filter(f => f.id !== id));
            } catch (err) {
              console.error('Nie udało się usunąć fiszki', err);
              alert('Wystąpił błąd podczas usuwania fiszki.');
            }
          }}
        />
      </div>
    );
  }

  // 4. Zdania z AI / LLM
  if (currentView === 'llm') {
    return (
      <LlmSentencesScreen
        flashcards={exerciseFlashcards}
        onBack={() => setCurrentView('exercises-hub')}
      />
    );
  }

  // Domyślnie: Główny pulpit (Dashboard)
  return (
    <DashboardScreen 
      onLogout={handleLogout} 
      onStartExercises={handleStartExercises} 
    />
  );
}