import { theme } from '../themes';
import React, { useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import type { Category } from '../types';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onCreateCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');

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
};