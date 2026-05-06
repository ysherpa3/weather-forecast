import { useReducer, useEffect } from "react";
import type { OnecallData, Units } from "@/types/weather";

type State = {
  data: OnecallData | null;
  isLoading: boolean;
  error: string | null;
};
type Action =
  | { type: "fetch" }
  | { type: "success"; data: OnecallData }
  | { type: "error"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "fetch":
      return { ...state, isLoading: true, error: null };
    case "success":
      return { data: action.data, isLoading: false, error: null };
    case "error":
      return { ...state, isLoading: false, error: action.error };
  }
}

export function useOnecall(
  lat: number | null,
  lon: number | null,
  units: Units,
) {
  const [state, dispatch] = useReducer(reducer, {
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (lat === null || lon === null) return;

    let cancelled = false;
    dispatch({ type: "fetch" });

    fetch(`/api/onecall?lat=${lat}&lon=${lon}&units=${units}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Failed to fetch weather");
        return d;
      })
      .then((d) => {
        if (!cancelled) dispatch({ type: "success", data: d });
      })
      .catch((err) => {
        if (!cancelled)
          dispatch({
            type: "error",
            error: err instanceof Error ? err.message : "Something went wrong",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, units]);

  if (lat === null || lon === null)
    return { data: null, isLoading: false, error: null };
  return state;
}
