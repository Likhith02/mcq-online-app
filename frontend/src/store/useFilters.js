import { create } from "zustand";

export const useFilters = create((set) => ({
  language: "",
  topic: "",
  difficulty: "",
  seed: 123,
  setFilter: (key, value) => set({ [key]: value }),
}));
