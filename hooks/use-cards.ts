"use client";

import { useQuery } from "@tanstack/react-query";
import { searchCards, getSets } from "@/actions/tcgdex";
import type { CardFilters } from "@/lib/types";

export function useCards(filters: CardFilters) {
  return useQuery({
    queryKey: ["cards", filters],
    queryFn: () => searchCards(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSets() {
  return useQuery({
    queryKey: ["sets"],
    queryFn: () => getSets(),
    staleTime: 30 * 60 * 1000, // 30 minutes - sets don't change often
  });
}
