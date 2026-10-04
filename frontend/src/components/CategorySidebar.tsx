import { theme } from '../themes';
import React, { useState } from 'react';
import { Layers, Plus, Trash2, Sparkles, WandSparkles, Merge, LoaderCircle, X } from 'lucide-react';
import type { Category, Flashcard } from '../types';
import { api } from '../api';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  onRefresh: () => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onDeleteCategory,
  onRefresh,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ name: string; cardIds: string[] }>>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [mergeName, setMergeName] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const callLlm = async (input: string, systemPrompt: string) => {
    const response = await fetch('http://6.tcp.eu.ngrok.io:10686/api/v1/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'bielik-minitron-7b-v3.0-instruct@q5_k_m',
        system_prompt: systemPrompt,
        input,
      }),
    });
    if (!response.ok) throw new Error('LLM error');
    const data = await response.json();
    return data.output?.[0]?.content?.trim() || '';
  };

  const getFlashcards = async (categoryId?: string) => {
    const response = await api.get(categoryId ? `/flashcards?categoryId=${categoryId}` : '/flashcards');
    return response.data as Flashcard[];
  };

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const getLocalCategoryMatches = (cards: Flashcard[], categories: Category[]) => {
    const matches: Array<{ cardId: string; categoryId: string }> = [];

    cards.forEach((card) => {
      const searchableText = `${card.word || ''} ${card.translation || ''}`;
      const normalizedCard = normalizeText(searchableText);
      let bestCategoryId = '';
      let bestScore = 0;

      categories.forEach((category) => {
        const normalizedCategory = normalizeText(category.name);
        if (!normalizedCategory) return;

        let score = 0;
        const categoryTokens = normalizedCategory.split(' ').filter(Boolean);

        if (normalizedCard.includes(normalizedCategory)) score += 18;
        if (normalizedCard.includes(category.name.toLowerCase())) score += 10;

        categoryTokens.forEach((token) => {
          if (!token) return;

          if (normalizedCard.includes(token)) score += 8;
          if (normalizedCard.split(' ').includes(token)) score += 4;
        });

        const cardWords = normalizedCard.split(' ').filter(Boolean);
        const overlap = categoryTokens.filter((token) => cardWords.includes(token));
        score += overlap.length * 6;

        if (score > bestScore) {
          bestScore = score;
          bestCategoryId = category.id;
        }
      });

      if (bestCategoryId && bestScore >= 8) {
        matches.push({ cardId: card.id, categoryId: bestCategoryId });
      }
    });

    return matches;
  };

  const suggestCategories = async () => {
    setLoadingAction('suggest');
    setMessage('');
    try {
      const cards = (await getFlashcards()).filter((card) => card.categoryId == null);
      if (!cards.length) {
        setMessage('Brak fiszek bez kategorii.');
        return;
      }
      const result = await callLlm(
        JSON.stringify(cards.map(({ id, word, translation }) => ({ id, word, translation }))),
        'Pogrupuj fiszki w sensowne kategorie. Zwróć wyłącznie JSON tablicę obiektów {"name":"nazwa","cardIds":["id"]}. Nie pomijaj fiszek.',
      );
      const parsed = JSON.parse(result.replace(/```json|```/g, '').trim()) as Array<{ name: string; cardIds: string[] }>;
      setSuggestions(parsed.filter((item) => item.name && item.cardIds?.length));
    } catch {
      setMessage('Nie udało się wygenerować propozycji kategorii.');
    } finally {
      setLoadingAction(null);
    }
  };

  const acceptSuggestion = async (suggestion: { name: string; cardIds: string[] }) => {
    setLoadingAction(`accept-${suggestion.name}`);
    try {
      const category = await api.post('/categories', { name: suggestion.name });
      await Promise.all(suggestion.cardIds.map((id) => api.patch(`/flashcards/${id}`, { categoryId: category.data.id })));
      setSuggestions((current) => current.filter((item) => item !== suggestion));
      onRefresh();
    } catch {
      setMessage('Nie udało się zaakceptować propozycji.');
    } finally {
      setLoadingAction(null);
    }
  };

  const dismissSuggestion = (suggestion: { name: string; cardIds: string[] }) => {
    setSuggestions((current) => current.filter((item) => item !== suggestion));
  };

  const matchExistingCategories = async () => {
    setLoadingAction('match');
    setMessage('');
    try {
      const cards = (await getFlashcards()).filter((card) => card.categoryId == null);
      if (!cards.length || !categories.length) {
        setMessage(!cards.length ? 'Brak fiszek bez kategorii.' : 'Najpierw utwórz kategorię.');
        return;
      }

      const localMatches = getLocalCategoryMatches(cards, categories);
      if (localMatches.length > 0) {
        await Promise.all(localMatches.map((match) => api.patch(`/flashcards/${match.cardId}`, { categoryId: match.categoryId })));
        setMessage(`Dopasowano ${localMatches.length} fiszek.`);
        onRefresh();
        return;
      }

      const result = await callLlm(
        JSON.stringify({ categories: categories.map(({ id, name }) => ({ id, name })), cards: cards.map(({ id, word, translation }) => ({ id, word, translation })) }),
        'Dopasuj każdą fiszkę do jednej z istniejących kategorii. Zwróć wyłącznie JSON tablicę obiektów {"cardId":"id","categoryId":"id"}. Pomijaj tylko całkowicie niedopasowane fiszki.',
      );
      const raw = result.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(raw) as Array<{ cardId: string; categoryId: string }>;
      const matches = Array.isArray(parsed) ? parsed : [];

      if (matches.length > 0) {
        await Promise.all(matches.map((match) => api.patch(`/flashcards/${match.cardId}`, { categoryId: match.categoryId })));
      }

      setMessage(matches.length ? `Dopasowano ${matches.length} fiszek.` : 'Brak oczywistych dopasowań do kategorii.');
      onRefresh();
    } catch {
      setMessage('Nie udało się dopasować fiszek.');
    } finally {
      setLoadingAction(null);
    }
  };

  const mergeCategories = async () => {
    if (selectedCategoryIds.length < 2 || !mergeName.trim()) return;
    setLoadingAction('merge');
    try {
      const target = await api.post('/categories', { name: mergeName.trim() });
      const cards = (await Promise.all(selectedCategoryIds.map((id) => getFlashcards(id)))).flat();
      await Promise.all(cards.map((card) => api.patch(`/flashcards/${card.id}`, { categoryId: target.data.id })));
      await Promise.all(selectedCategoryIds.map((id) => api.delete(`/categories/${id}`)));
      setSelectedCategoryIds([]);
      setMergeName('');
      setMessage('Kategorie zostały połączone.');
      onRefresh();
    } catch {
      setMessage('Nie udało się połączyć kategorii.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onCreateCategory(newCategoryName);
    setNewCategoryName('');
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <Layers size={18} color={theme.colors.primary} />
        <h3 style={styles.sidebarTitle}>Kategorie</h3>
      </div>

      <form onSubmit={handleSubmit} style={styles.catForm}>
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
          onClick={() => onSelectCategory('')}
        >
          Wszystkie fiszki
        </button>

        <button
          style={{
            ...styles.catItem,
            ...(selectedCategoryId === 'uncategorized' ? styles.catItemActive : {}),
          }}
          onClick={() => onSelectCategory('uncategorized')}
        >
          Bez kategorii
        </button>
        
        {categories.map((cat) => (
          <div key={cat.id} style={styles.catRow}>
            <button
              style={{
                ...styles.catItem,
                ...(selectedCategoryId === cat.id ? styles.catItemActive : {}),
                flex: 1, 
              }}
              onClick={() => onSelectCategory(cat.id)}
            >
              {cat.name}
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCategory(cat.id);
              }}
              style={styles.btnCatDelete}
              title="Usuń kategorię"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      <div style={styles.tools}>
        <button onClick={suggestCategories} style={styles.toolButton} disabled={!!loadingAction}>
          {loadingAction === 'suggest' ? <LoaderCircle size={15} style={styles.spinner} /> : <Sparkles size={15} />}
          {loadingAction === 'suggest' ? 'Analizuję fiszki...' : 'Zaproponuj kategorie AI'}
        </button>
        <button onClick={matchExistingCategories} style={styles.toolButton} disabled={!!loadingAction}>
          {loadingAction === 'match' ? <LoaderCircle size={15} style={styles.spinner} /> : <WandSparkles size={15} />}
          {loadingAction === 'match' ? 'Dopasowuję fiszki...' : 'Dopasuj do kategorii'}
        </button>
        <div style={styles.mergeBox}>
          <strong style={styles.toolTitle}><Merge size={15} /> Połącz kategorie</strong>
          {categories.map((category) => (
            <label key={category.id} style={styles.checkboxLabel}>
              <input type="checkbox" checked={selectedCategoryIds.includes(category.id)} onChange={() => setSelectedCategoryIds((current) => current.includes(category.id) ? current.filter((id) => id !== category.id) : [...current, category.id])} />
              {category.name}
            </label>
          ))}
          <input value={mergeName} onChange={(event) => setMergeName(event.target.value)} placeholder="Nowa nazwa..." style={styles.catInput} />
          <button onClick={mergeCategories} style={styles.toolButton} disabled={!!loadingAction || selectedCategoryIds.length < 2 || !mergeName.trim()}>
            {loadingAction === 'merge' && <LoaderCircle size={15} style={styles.spinner} />}
            {loadingAction === 'merge' ? 'Łączę kategorie...' : 'Połącz wybrane'}
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div style={styles.suggestions}>
          <strong style={styles.toolTitle}><Sparkles size={15} /> Propozycje AI</strong>
          {suggestions.map((suggestion) => (
            <div key={suggestion.name} style={styles.suggestion}>
              <span>{suggestion.name} ({suggestion.cardIds.length})</span>
              <div style={styles.suggestionActions}>
                <button onClick={() => acceptSuggestion(suggestion)} style={styles.acceptButton} disabled={!!loadingAction}>
                  {loadingAction === `accept-${suggestion.name}` && <LoaderCircle size={12} style={styles.spinner} />}
                  {loadingAction === `accept-${suggestion.name}` ? 'Zapisuję...' : 'Akceptuj'}
                </button>
                <button
                  onClick={() => dismissSuggestion(suggestion)}
                  style={styles.dismissButton}
                  disabled={!!loadingAction}
                  title="Odrzuć propozycję"
                  aria-label={`Odrzuć propozycję kategorii ${suggestion.name}`}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {message && <p style={styles.message}>{message}</p>}
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: { width: '260px', backgroundColor: theme.colors.white, padding: '1.2rem', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, height: 'fit-content' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' },
  sidebarTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: theme.colors.textStrong },
  catForm: { display: 'flex', gap: '6px', marginBottom: '1rem' },
  catInput: { 
    flex: 1, 
    padding: '8px 10px', 
    borderRadius: '6px', 
    border: `1px solid ${theme.colors.borderStrong}`, 
    fontSize: '13px',
    backgroundColor: theme.colors.white,
    color: theme.colors.black,
    outline: 'none'
  },
  
  btnCatAdd: { padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: theme.colors.primary, color: theme.colors.white, cursor: 'pointer' },
  catList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  catRow: { display: 'flex', alignItems: 'center', gap: '4px' },
  catItem: { textAlign: 'left', padding: '10px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: theme.colors.textBody, cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' },
  catItemActive: { backgroundColor: theme.colors.primarySoft, color: theme.colors.primaryDark, fontWeight: 600 },
  btnCatDelete: { padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: theme.colors.danger, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' },
  tools: { display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '1.25rem', paddingTop: '1rem', borderTop: `1px solid ${theme.colors.border}` },
  toolButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${theme.colors.border}`, background: theme.gradients.primary, color: theme.colors.white, cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
  mergeBox: { display: 'flex', flexDirection: 'column', gap: '6px', padding: '9px', marginTop: '2px', borderRadius: '8px', backgroundColor: theme.colors.surfaceMuted },
  toolTitle: { display: 'flex', alignItems: 'center', gap: '5px', color: theme.colors.textStrong, fontSize: '12px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '6px', color: theme.colors.textBody, fontSize: '12px' },
  suggestions: { display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px', padding: '9px', borderRadius: '8px', backgroundColor: theme.colors.primarySoft },
  suggestion: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '5px', color: theme.colors.textBody, fontSize: '12px' },
  suggestionActions: { display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 },
  acceptButton: { padding: '5px 7px', border: 'none', borderRadius: '6px', backgroundColor: theme.colors.primary, color: theme.colors.white, cursor: 'pointer', fontSize: '11px', fontWeight: 600 },
  dismissButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', border: `1px solid ${theme.colors.borderStrong}`, borderRadius: '6px', backgroundColor: theme.colors.white, color: theme.colors.textMuted, cursor: 'pointer' },
  message: { margin: '9px 0 0', color: theme.colors.textMuted, fontSize: '11px', lineHeight: 1.4 },
  spinner: { animation: 'spin 0.8s linear infinite' },
};