import { create } from 'zustand';
import type { GearCategory, GearCondition } from '../types/gear';

interface ListingDraftState {
  category: GearCategory | null;
  name: string;
  brand: string;
  model: string;
  description: string;
  condition: GearCondition | null;
  replacementValue: number;
  dailyPrice: number;
  depositAmount: number;
  pickupArea: string;
  setCategory: (category: GearCategory) => void;
  setName: (name: string) => void;
  setBrand: (brand: string) => void;
  setModel: (model: string) => void;
  setDescription: (description: string) => void;
  setCondition: (condition: GearCondition) => void;
  setReplacementValue: (value: number) => void;
  setDailyPrice: (price: number) => void;
  setDepositAmount: (deposit: number) => void;
  setPickupArea: (area: string) => void;
  reset: () => void;
}

const initialState = {
  category: null as GearCategory | null,
  name: '',
  brand: '',
  model: '',
  description: '',
  condition: null as GearCondition | null,
  replacementValue: 0,
  dailyPrice: 0,
  depositAmount: 0,
  pickupArea: '',
};

export const useListingDraftStore = create<ListingDraftState>((set) => ({
  ...initialState,
  setCategory: (category) => set({ category }),
  setName: (name) => set({ name }),
  setBrand: (brand) => set({ brand }),
  setModel: (model) => set({ model }),
  setDescription: (description) => set({ description }),
  setCondition: (condition) => set({ condition }),
  setReplacementValue: (replacementValue) => set({ replacementValue }),
  setDailyPrice: (dailyPrice) => set({ dailyPrice }),
  setDepositAmount: (depositAmount) => set({ depositAmount }),
  setPickupArea: (pickupArea) => set({ pickupArea }),
  reset: () => set(initialState),
}));
