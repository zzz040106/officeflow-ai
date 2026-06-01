export const CITIES = [
  {
    id: "nanjing",
    name: "Nanjing",
    localName: "南京",
    latitude: 32.0603,
    longitude: 118.7969,
    timezone: "Asia/Shanghai",
  },
  {
    id: "shanghai",
    name: "Shanghai",
    localName: "上海",
    latitude: 31.2304,
    longitude: 121.4737,
    timezone: "Asia/Shanghai",
  },
  {
    id: "beijing",
    name: "Beijing",
    localName: "北京",
    latitude: 39.9042,
    longitude: 116.4074,
    timezone: "Asia/Shanghai",
  },
  {
    id: "guangzhou",
    name: "Guangzhou",
    localName: "广州",
    latitude: 23.1291,
    longitude: 113.2644,
    timezone: "Asia/Shanghai",
  },
];

const CURRENT_FIELDS = "temperature_2m,rain,precipitation,weather_code";

export function buildOpenMeteoUrl({ latitude, longitude, timezone }) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", CURRENT_FIELDS);
  url.searchParams.set("timezone", timezone || "auto");
  return url;
}

export function isRainyWeather(weather) {
  return Number(weather?.rain || 0) > 0 || Number(weather?.precipitation || 0) > 0;
}

export function normalizeWeather(payload) {
  const current = payload?.current || {};
  const units = payload?.current_units || {};
  const summary = {
    temperature: current.temperature_2m ?? null,
    temperatureUnit: units.temperature_2m || "°C",
    rain: Number(current.rain || 0),
    rainUnit: units.rain || "mm",
    precipitation: Number(current.precipitation || 0),
    precipitationUnit: units.precipitation || "mm",
    weatherCode: current.weather_code ?? null,
    time: current.time || null,
  };

  return {
    ...summary,
    rainy: isRainyWeather(summary),
  };
}

export function getCityById(cityId) {
  return CITIES.find((city) => city.id === cityId) || CITIES[0];
}

export async function fetchOpenMeteoWeather(city, fetchImpl = fetch) {
  const url = buildOpenMeteoUrl(city);
  const response = await fetchImpl(url);

  if (!response.ok) {
    throw new Error(`Weather API request failed with ${response.status}`);
  }

  return normalizeWeather(await response.json());
}
