import { create } from 'zustand';

interface RentalDraftState {
  listingId: string | null;
  startDate: string | null;
  endDate: string | null;
  intendedUse: string | null;
  setListingId: (id: string) => void;
  setDates: (startDate: string, endDate: string) => void;
  setIntendedUse: (use: string) => void;
  reset: () => void;
}

export const useRentalDraftStore = create<RentalDraftState>((set) => ({
  listingId: null,
  startDate: null,
  endDate: null,
  intendedUse: null,
  setListingId: (listingId) => set({ listingId }),
  setDates: (startDate, endDate) => set({ startDate, endDate }),
  setIntendedUse: (intendedUse) => set({ intendedUse }),
  reset: () =>
    set({
      listingId: null,
      startDate: null,
      endDate: null,
      intendedUse: null,
    }),
}));
