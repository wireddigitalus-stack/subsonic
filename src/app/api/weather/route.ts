import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface WeatherReport {
  temp: number;
  tempMin?: number;
  tempMax?: number;
  feelsLike?: number;
  dewPoint?: number;
  humidity: number;
  pressureHpa: number;
  pressureInHg: number;
  windSpeed: number;
  windGusts: number;
  windDirection: string;
  windDegrees: number;
  densityAltitude: number;
  mach1Fps: number;
  condition: string;
  location: string;
  elevationFt: number;
  stationName: string;
  updatedAt: string;
  isLive: boolean;
}

// In-memory cache to avoid rate-limiting Open-Meteo
let cachedWeather: WeatherReport | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

function degreesToCompass(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(deg / 22.5) % 16;
  return directions[index];
}

function wmoCodeToCondition(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Mountain Fog";
  if (code >= 51 && code <= 55) return "Light Drizzle";
  if (code >= 61 && code <= 65) return "Rain";
  if (code >= 71 && code <= 77) return "Snow Flurries";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 95) return "Thunderstorms";
  return "Partly Cloudy";
}

/**
 * Standard atmospheric Density Altitude calculated from station surface pressure & temperature
 * Uses the standard US Standard Atmosphere barometric equation:
 * Pressure Alt = (1 - (P_station / 1013.25)^0.190284) * 145366.45
 * Density Alt = PA + 118.8 * (OAT_Celsius - ISA_Temp_at_PA)
 */
function calculateDensityAltitude(tempF: number, pressureHpa: number): number {
  const tempC = ((tempF - 32) * 5) / 9;
  const pressureAlt = (1 - Math.pow(pressureHpa / 1013.25, 0.190284)) * 145366.45;
  const isaTemp = 15 - pressureAlt * 0.0019812;
  const da = Math.round(pressureAlt + 118.8 * (tempC - isaTemp));
  return da;
}

/**
 * Speed of sound in feet per second (Mach 1) based on ambient temperature
 * v = 49.02 * sqrt(Rankine)
 */
function calculateMach1Fps(tempF: number): number {
  const rankine = tempF + 459.67;
  return Math.round(49.02 * Math.sqrt(rankine));
}

export async function GET() {
  const now = Date.now();
  if (cachedWeather && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json(cachedWeather);
  }

  // Holston Mountain / The Hideout range coordinates in Bristol TN area:
  // Lat: 36.52, Lon: -82.10, Elevation: 3,420 ft (1,042.4 meters)
  const latitude = 36.52;
  const longitude = -82.10;
  const elevationMeters = 1042;
  const elevationFt = 3420;

  try {
    // Request Open-Meteo with exact mountain elevation (1,042m) to receive true ridge-top telemetry
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&elevation=${elevationMeters}&current=temperature_2m,relative_humidity_2m,dew_point_2m,surface_pressure,wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`;

    const res = await fetch(url, {
      next: { revalidate: 180 },
      headers: { "User-Agent": "SubsonicSociety-Ballistics/1.0" },
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;

    const tempF = Math.round(current.temperature_2m);
    const dewPoint = current.dew_point_2m !== undefined ? Math.round(current.dew_point_2m) : undefined;
    const humidity = Math.round(current.relative_humidity_2m);
    const pressureHpa = Math.round((current.surface_pressure || 905) * 10) / 10;
    const pressureInHg = Math.round(pressureHpa * 0.02953 * 100) / 100;
    const windSpeed = Math.round(current.wind_speed_10m);
    const windGusts = Math.round(current.wind_gusts_10m || current.wind_speed_10m * 1.3);
    const windDeg = current.wind_direction_10m || 0;
    const windDirection = degreesToCompass(windDeg);
    const condition = wmoCodeToCondition(current.weather_code || 0);
    const densityAltitude = calculateDensityAltitude(tempF, pressureHpa);
    const mach1Fps = calculateMach1Fps(tempF);

    const report: WeatherReport = {
      temp: tempF,
      dewPoint,
      humidity,
      pressureHpa,
      pressureInHg,
      windSpeed,
      windGusts,
      windDirection,
      windDegrees: windDeg,
      densityAltitude,
      mach1Fps,
      condition,
      location: "Holston Ridge",
      elevationFt,
      stationName: "Ridge Station 2",
      updatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      isLive: true,
    };

    cachedWeather = report;
    lastFetchTime = now;

    return NextResponse.json(report);
  } catch (err: any) {
    console.warn("Weather fetch failed, using mountain station fallback:", err.message);

    // Realistic fallback for Bristol TN mountain range at 3,420 FT
    const fallbackReport: WeatherReport = cachedWeather || {
      temp: 64,
      dewPoint: 42,
      humidity: 48,
      pressureHpa: 905.2,
      pressureInHg: 26.73,
      windSpeed: 5,
      windGusts: 9,
      windDirection: "WNW",
      windDegrees: 290,
      densityAltitude: 3820,
      mach1Fps: 1122,
      condition: "Clear",
      location: "Holston Ridge",
      elevationFt: 3420,
      stationName: "Ridge Station 2",
      updatedAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
      isLive: false,
    };

    return NextResponse.json(fallbackReport);
  }
}
