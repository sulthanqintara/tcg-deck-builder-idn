"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { searchCards, getSets } from "@/actions/tcgdex";
import type { CardFilters } from "@/lib/types";

const CARDS_PER_PAGE = 50;

export function useCards(filters: CardFilters) {
  return useQuery({
    queryKey: ["cards", filters],
    queryFn: () => searchCards({ ...filters, page: 0, limit: CARDS_PER_PAGE }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInfiniteCards(filters: CardFilters) {
  return useInfiniteQuery({
    queryKey: ["cards-infinite", filters],
    queryFn: ({ pageParam = 0 }) =>
      searchCards({ ...filters, page: pageParam, limit: CARDS_PER_PAGE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
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
