"use client";

import { useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  type CardFilters,
  type CardCategory,
  type RegulationType,
  DEFAULT_FILTERS,
} from "@/lib/types";
import { useDeckStore } from "@/store/use-deck-store";

// Hydration-safe hook to check if we're on the client
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Parses URL search params into CardFilters object
 */
function parseFiltersFromParams(params: URLSearchParams): Partial<CardFilters> {
  const filters: Partial<CardFilters> = {};

  const search = params.get("q");
  if (search) filters.search = search;

  const category = params.get("category");
  if (category) filters.category = category as CardCategory;

  const regulation = params.get("regulation");
  if (regulation) filters.regulation = regulation as RegulationType;

  const setId = params.get("set");
  if (setId) filters.setId = setId;

  const rarities = params.get("rarities");
  if (rarities) filters.rarities = rarities.split(",").filter(Boolean);

  const specialCards = params.get("special");
  if (specialCards)
    filters.specialCards = specialCards.split(",").filter(Boolean);

  const energyTypes = params.get("energy");
  if (energyTypes) filters.energyTypes = energyTypes.split(",").filter(Boolean);

  const illustrator = params.get("illustrator");
  if (illustrator) filters.illustrator = illustrator;

  return filters;
}

/**
 * Converts CardFilters to URL search params string
 * Only includes non-default values to keep URL clean
 */
function filtersToParams(filters: CardFilters): string {
  const params = new URLSearchParams();

  if (filters.search && filters.search !== DEFAULT_FILTERS.search) {
    params.set("q", filters.search);
  }

  if (filters.category && filters.category !== DEFAULT_FILTERS.category) {
    params.set("category", filters.category);
  }

  if (filters.regulation && filters.regulation !== DEFAULT_FILTERS.regulation) {
    params.set("regulation", filters.regulation);
  }

  if (filters.setId && filters.setId !== DEFAULT_FILTERS.setId) {
    params.set("set", filters.setId);
  }

  if (filters.rarities.length > 0) {
    params.set("rarities", filters.rarities.join(","));
  }

  if (filters.specialCards.length > 0) {
    params.set("special", filters.specialCards.join(","));
  }

  if (filters.energyTypes.length > 0) {
    params.set("energy", filters.energyTypes.join(","));
  }

  if (
    filters.illustrator &&
    filters.illustrator !== DEFAULT_FILTERS.illustrator
  ) {
    params.set("illustrator", filters.illustrator);
  }

  return params.toString();
}

/**
 * Hook to sync filters with URL query params
 * - On mount: reads URL params and sets them as initial filters
 * - On filter change: updates URL params (without page refresh)
 */
export function useFilterParams() {
  const searchParams = useSearchParams();
  const { filters, setFilters } = useDeckStore();
  const isClient = useIsClient();
  const isInitialized = useRef(false);
  const isUpdatingFromUrl = useRef(false);

  // On mount (client-side only), parse URL params and apply to store
  useEffect(() => {
    if (!isClient) return;
    if (isInitialized.current) return;
    isInitialized.current = true;

    const paramFilters = parseFiltersFromParams(searchParams);

    // Only update if URL has any filter params
    if (Object.keys(paramFilters).length > 0) {
      isUpdatingFromUrl.current = true;
      setFilters({
        ...DEFAULT_FILTERS,
        ...paramFilters,
      });
      // Reset flag after a tick to allow subsequent updates to sync to URL
      requestAnimationFrame(() => {
        isUpdatingFromUrl.current = false;
      });
    }
  }, [isClient, searchParams, setFilters]);

  // Sync filters to URL when they change (client-side only)
  useEffect(() => {
    if (!isClient) return;
    // Skip if we're in the middle of applying URL params to store
    if (isUpdatingFromUrl.current) return;
    // Skip initial render before initialization
    if (!isInitialized.current) return;

    const queryString = filtersToParams(filters);
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    // Use replaceState to avoid polluting browser history on every keystroke
    window.history.replaceState(null, "", newUrl);
  }, [isClient, filters]);

  // Wrapper for setFilters that also updates URL
  const setFiltersWithParams = useCallback(
    (newFilters: CardFilters) => {
      setFilters(newFilters);
    },
    [setFilters]
  );

  return { filters, setFilters: setFiltersWithParams };
}
