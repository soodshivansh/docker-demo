"use client";

import { useState } from "react";
import axios from "axios";

interface WeatherData {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  description: string;
  feelsLike: number;
  weatherCode: number;
}

const indianCities: { name: string; lat: number; lon: number }[] = [
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Delhi", lat: 28.6139, lon: 77.209 },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Hyderabad", lat: 17.385, lon: 78.4867 },
  { name: "Pune", lat: 18.5204, lon: 73.8567 },
  { name: "Ahmedabad", lat: 23.0225, lon: 72.5714 },
  { name: "Jaipur", lat: 26.9124, lon: 75.7873 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
];

function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail",
  };
  return descriptions[code] || "Unknown";
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌧️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "🌦️";
  return "⛈️";
}

export default function Home() {
  const [selectedCity, setSelectedCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!selectedCity) {
      setError("Please select a city");
      return;
    }

    const city = indianCities.find((c) => c.name === selectedCity);
    if (!city) return;

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`
      );

      const current = data.current;

      setWeather({
        city: city.name,
        temperature: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeed: Math.round(current.wind_speed_10m),
        description: getWeatherDescription(current.weather_code),
        feelsLike: Math.round(current.apparent_temperature),
        weatherCode: current.weather_code,
      });
    } catch {
      setError("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          🇮🇳 India Weather
        </h1>
        <p className="text-center text-gray-400 mb-6">
          Check weather for major Indian cities
        </p>

        <div className="space-y-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full p-4 rounded-xl bg-gray-700 border-2 border-gray-600 focus:border-cyan-500 focus:outline-none text-gray-100 text-lg"
            aria-label="Select a city"
          >
            <option value="">Select a city...</option>
            {indianCities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchWeather}
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:text-gray-400 text-white font-semibold py-4 rounded-xl transition-colors text-lg"
          >
            {loading ? "Loading..." : "Get Weather"}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-400 text-center" role="alert">
            {error}
          </p>
        )}

        {weather && (
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold text-white">
              {weather.city}
            </h2>
            <div className="text-6xl my-4">
              {getWeatherEmoji(weather.weatherCode)}
            </div>
            <p className="text-5xl font-bold text-white">
              {weather.temperature}°C
            </p>
            <p className="text-xl text-gray-300 mt-2">{weather.description}</p>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-600">
              <div>
                <p className="text-gray-400 text-sm">Feels Like</p>
                <p className="text-xl font-semibold text-cyan-400">
                  {weather.feelsLike}°C
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Humidity</p>
                <p className="text-xl font-semibold text-cyan-400">
                  {weather.humidity}%
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Wind</p>
                <p className="text-xl font-semibold text-cyan-400">
                  {weather.windSpeed} km/h
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
