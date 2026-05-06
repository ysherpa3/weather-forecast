export type Units = "metric" | "imperial";

export interface OnecallCurrent {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  rain?: { "1h": number };
  snow?: { "1h": number };
}

export interface OnecallHourly {
  dt: number;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  pop: number;
}

export interface DailyItem {
  dateLabel: string;
  tempMin: number;
  tempMax: number;
  weather: { id: number; main: string; description: string; icon: string };
  popMax: number;
}

export interface OnecallData {
  current: OnecallCurrent;
  hourly: OnecallHourly[];
  today: { tempMin: number; tempMax: number };
  days: DailyItem[];
  timezone_offset: number;
}
