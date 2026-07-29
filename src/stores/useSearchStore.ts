import { create } from 'zustand';
import type { ListingSearchInput } from '../types/listing';

interface SearchState {
  query: string;
  category: string | null;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sortBy: ListingSearchInput['sortBy'];
  setQuery: (query: string) => void;
  setCategory: (category: string | null) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setSortBy: (sortBy: ListingSearchInput['sortBy']) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  category: null,
  minPrice: undefined,
  maxPrice: undefined,
  sortBy: undefined,
  setQuery: (query) => set({ query }),
  setCategory: (category) => set({ category }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setSortBy: (sortBy) => set({ sortBy }),
  resetFilters: () =>
    set({
      query: '',
      category: null,
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: undefined,
    }),
}));
