import { useReducer, useEffect } from "react";
import type { GeocodingResult } from "@/types/location";
import { useDebounce } from "./useDebounce";

type State = { results: GeocodingResult[]; isLoading: boolean };
type Action =
  | { type: "fetch" }
  | { type: "success"; results: GeocodingResult[] }
  | { type: "error" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return { ...state, isLoading: true };
    case "success":
      return { results: action.results, isLoading: false };
    case "error":
      return { results: [], isLoading: false };
  }
}

export function useGeocode(query: string) {
  const [state, dispatch] = useReducer(reducer, {
    results: [],
    isLoading: false,
  });
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length < 2) return;

    let cancelled = false;
    dispatch({ type: "fetch" });

    fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled)
          dispatch({ type: "success", results: Array.isArray(d) ? d : [] });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const active = debouncedQuery.length >= 2;
  return {
    results: active ? state.results : [],
    isLoading: active && state.isLoading,
  };
}
