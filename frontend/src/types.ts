export interface Category {
  id: string;
  name: string;
}

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  definition?: string;
  synonyms?: string[];
  categoryId?: string | null;
}