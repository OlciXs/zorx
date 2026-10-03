import React, { useState } from 'react';
import { Layers, Plus } from 'lucide-react';
import type { Category } from '../types';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  onCreateCategory: (name: string) => void;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreateCategory,
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
        <Layers size={18} color="#4f46e5" />
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
          <button
            key={cat.id}
            style={{
              ...styles.catItem,
              ...(selectedCategoryId === cat.id ? styles.catItemActive : {}),
            }}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </aside>
  );
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: { width: '260px', backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' },
  sidebarTitle: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  catForm: { display: 'flex', gap: '6px', marginBottom: '1rem' },
  catInput: { flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' },
  btnCatAdd: { padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#4f46e5', color: '#fff', cursor: 'pointer' },
  catList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  catItem: { width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#475569', cursor: 'pointer', fontSize: '14px' },
  catItemActive: { backgroundColor: '#e0e7ff', color: '#4338ca', fontWeight: 600 },
};