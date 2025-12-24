import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  type DeckItem,
  type Card,
  type CardFilters,
  DEFAULT_FILTERS,
} from "@/lib/types";

interface DeckStore {
  deck: DeckItem[];
  filters: CardFilters;

  setFilters: (filters: CardFilters) => void;
  updateFilter: <K extends keyof CardFilters>(
    key: K,
    value: CardFilters[K]
  ) => void;
  resetFilters: () => void;
  addToDeck: (card: Card) => void;
  removeFromDeck: (cardId: string) => void;
  setCardCount: (card: Card, count: number) => void;
  clearDeck: () => void;
}

export const useDeckStore = create<DeckStore>()(
  persist(
    (set, get) => ({
      deck: [],
      filters: DEFAULT_FILTERS,

      setFilters: (filters) => set({ filters }),

      updateFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      addToDeck: (card) => {
        const { deck } = get();
        const existing = deck.find((c) => c.id === card.id);

        if (existing) {
          if (existing.count >= 4) {
            const isBasicEnergy =
              card.category === "Energy" && card.stage === "Basic";
            if (!isBasicEnergy) {
              toast.error("Max 4 copies allowed (except Basic Energy)");
              return;
            }
          }
          set({
            deck: deck.map((c) =>
              c.id === card.id ? { ...c, count: c.count + 1 } : c
            ),
          });
        } else {
          set({ deck: [...deck, { ...card, count: 1 }] });
        }
      },

      removeFromDeck: (cardId) => {
        const { deck } = get();
        const existing = deck.find((c) => c.id === cardId);
        if (existing && existing.count > 1) {
          set({
            deck: deck.map((c) =>
              c.id === cardId ? { ...c, count: c.count - 1 } : c
            ),
          });
        } else {
          set({ deck: deck.filter((c) => c.id !== cardId) });
        }
      },

      setCardCount: (card, count) => {
        if (count < 0) return;

        const isBasicEnergy =
          card.category === "Energy" && card.subtype === "Basic";
        const newCount = isBasicEnergy ? count : Math.min(count, 4);

        if (!isBasicEnergy && count > 4) {
          toast.error("Max 4 copies allowed (except Basic Energy)");
        }

        set((state) => {
          if (newCount === 0) {
            return { deck: state.deck.filter((c) => c.id !== card.id) };
          }

          const existing = state.deck.find((c) => c.id === card.id);
          if (existing) {
            return {
              deck: state.deck.map((c) =>
                c.id === card.id ? { ...c, count: newCount } : c
              ),
            };
          }
          return { deck: [...state.deck, { ...card, count: newCount }] };
        });
      },

      clearDeck: () => set({ deck: [] }),
    }),
    {
      name: "deck-storage",
      partialize: (state) => ({ deck: state.deck }),
    }
  )
);
