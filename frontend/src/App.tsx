import React, { useState, useEffect } from 'react';
import { api } from './api';
import { LogIn, UserPlus, LogOut, Layers, Plus, BookOpen, Trash2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface Flashcard {
  id: string;
  word: string;
  translation: string;
  definition?: string;
  synonyms?: string[];
  categoryId?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (token) {
      fetchCategories();
      fetchFlashcards();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchFlashcards(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  // Rozdzielona, poprawna logika logowania i rejestracji
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // --- REJESTRACJA ---
        await api.post('/users/register', { email, password });
        alert('Konto zostało utworzone! Teraz możesz się zalogować.');
        setIsRegistering(false);
        setPassword('');
      } else {
        // --- LOGOWANIE ---
        const res = await api.post('/users/login', { email, password });
        
        // Pobieramy token zwrotny z backendu
        const authToken = res.data.accessToken || res.data.token || res.data.access_token;
        
        if (authToken) {
          localStorage.setItem('token', authToken);
          setToken(authToken);
        } else {
          alert('Zalogowano, ale backend nie przekazał tokena JWT.');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(', ') : msg || 'Błąd autoryzacji');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setFlashcards([]);
    setCategories([]);
  };

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
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error('Błąd pobierania fiszek', err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/categories', { name: newCategoryName });
      setNewCategoryName('');
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

  // EKRAN LOGOWANIA / REJESTRACJI
  if (!token) {
    return (
      <div style={styles.authBg}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <div style={styles.iconCircle}>
              <BookOpen size={28} color="#4f46e5" />
            </div>
            <h2 style={styles.authTitle}>
              {isRegistering ? 'Stwórz konto' : 'Witaj z powrotem'}
            </h2>
            <p style={styles.authSubtitle}>
              {isRegistering 
                ? 'Zarejestruj się, aby zapisywać fiszki i kategorie' 
                : 'Zaloguj się do swojego panelu nauki'}
            </p>
          </div>

          <form onSubmit={handleAuth} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Adres Email</label>
              <input
                type="email"
                placeholder="twoj@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Hasło</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.btnSubmit}>
              {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isRegistering ? 'Utwórz konto' : 'Zaloguj się'}
            </button>
          </form>

          <div style={styles.authFooter}>
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              style={styles.btnToggle}
            >
              {isRegistering 
                ? 'Masz już konto? Zaloguj się' 
                : 'Nie masz jeszcze konta? Zarejestruj się'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  // EKRAN GŁÓWNY APILKACJI
  return (
    <div style={styles.appBg}>
      <header style={styles.navbar}>
        <div style={styles.navBrand}>
          <BookOpen size={24} color="#4f46e5" />
          <span style={styles.navTitle}>Zorx Flashcards</span>
        </div>
        <button onClick={handleLogout} style={styles.btnLogout}>
          <LogOut size={16} /> Wyloguj się
        </button>
      </header>

      <div style={styles.mainLayout}>
        {/* PANEL BOCZNY */}
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <Layers size={18} color="#4f46e5" />
            <h3 style={styles.sidebarTitle}>Kategorie</h3>
          </div>

          <form onSubmit={handleCreateCategory} style={styles.catForm}>
            <input
              type="text"
              placeholder="Nowa kategoria..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              style={styles.catInput}
            />
            <button type="submit" style={styles.btnCatAdd}>
              <Plus size={16} />
            </button>
          </form>

          <div style={styles.catList}>
            <button
              style={{
                ...styles.catItem,
                ...(selectedCategoryId === '' ? styles.catItemActive : {}),
              }}
              onClick={() => setSelectedCategoryId('')}
            >
              Wszystkie fiszki
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                style={{
                  ...styles.catItem,
                  ...(selectedCategoryId === cat.id ? styles.catItemActive : {}),
                }}
                onClick={() => setSelectedCategoryId(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </aside>

        {/* OBSZAR FISZEK */}
        <main style={styles.contentArea}>
          {flashcards.length === 0 ? (
            <div style={styles.emptyCard}>
              <Sparkles size={40} color="#a5b4fc" style={{ marginBottom: '12px' }} />
              <h3 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>Brak fiszek</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                Nie masz jeszcze żadnych fiszek w tej kategorii. Dodaj nowe słówka używając wtyczki Chrome!
              </p>
            </div>
          ) : (
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
                  onClick={() => {
                    setCurrentIndex(currentIndex - 1);
                    setIsFlipped(false);
                  }}
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
                  onClick={() => {
                    setCurrentIndex(currentIndex + 1);
                    setIsFlipped(false);
                  }}
                  style={{
                    ...styles.btnNav,
                    opacity: currentIndex === flashcards.length - 1 ? 0.4 : 1,
                    cursor: currentIndex === flashcards.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Następna <ChevronRight size={18} />
                </button>

                <button
                  onClick={() => handleDeleteFlashcard(currentCard.id)}
                  style={styles.btnDelete}
                  title="Usuń fiszkę"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// NOWOCZESNE STYLE CSS-IN-JS
const styles: Record<string, React.CSSProperties> = {
  authBg: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f1f5f9' },
  authCard: { backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '16px', width: '100%', maxWidth: '380px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)' },
  authHeader: { textAlign: 'center', marginBottom: '1.5rem' },
  iconCircle: { width: '56px', height: '56px', backgroundColor: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' },
  authTitle: { margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: '#0f172a' },
  authSubtitle: { margin: 0, fontSize: '13px', color: '#64748b' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.2rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '12px', fontWeight: 600, color: '#334155' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' },
  btnSubmit: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: 600, cursor: 'pointer', fontSize: '14px', marginTop: '8px' },
  authFooter: { marginTop: '1.5rem', textAlign: 'center' },
  btnToggle: { background: 'none', border: 'none', color: '#4f46e5', fontSize: '13px', fontWeight: 500, cursor: 'pointer' },

  appBg: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0' },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navTitle: { fontSize: '18px', fontWeight: 700, color: '#0f172a' },
  btnLogout: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #e2e8f0', padding: '8px 12px', borderRadius: '6px', color: '#64748b', cursor: 'pointer', fontSize: '13px' },

  mainLayout: { display: 'flex', maxWidth: '1100px', margin: '2rem auto', gap: '2rem', padding: '0 1rem' },
  sidebar: { width: '260px', backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' },
  sidebarTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  catForm: { display: 'flex', gap: '6px', marginBottom: '1rem' },
  catInput: { flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' },
  btnCatAdd: { padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', cursor: 'pointer' },
  catList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  catItem: { width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '14px' },
  catItemActive: { backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 600 },

  contentArea: { flex: 1, display: 'flex', justifyContent: 'center' },
  emptyCard: { width: '100%', maxWidth: '480px', backgroundColor: '#ffffff', border: '2px dashed #cbd5e1', borderRadius: '16px', padding: '3rem', textAlign: 'center' },
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
  btnDelete: { padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#fef2f2', color: '#ef4444', cursor: 'pointer' }
};