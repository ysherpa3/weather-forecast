import { create } from "zustand";
import type { Units } from "@/types/weather";
import type { GeocodingResult } from "@/types/location";

interface WeatherStore {
  units: Units;
  setUnits: (units: Units) => void;
  selectedCity: GeocodingResult | null;
  setSelectedCity: (city: GeocodingResult | null) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  units: "metric",
  setUnits: (units) => set({ units }),
  selectedCity: null,
  setSelectedCity: (city) => set({ selectedCity: city }),
}));
