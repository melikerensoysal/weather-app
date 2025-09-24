const cityInput = document.getElementById("city-input");
const geoBtn = document.getElementById("geo-btn");
const loading = document.getElementById("loading");
const errorDiv = document.getElementById("error");
const weatherCard = document.getElementById("weather-card");
const cityName = document.getElementById("city-name");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");

const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";

const weatherCodes = {
  0: "☀️ Clear sky",
  1: "🌤️ Mainly clear",
  2: "⛅ Partly cloudy",
  3: "☁️ Overcast",
  45: "🌫️ Fog",
  48: "🌫️ Depositing rime fog",
  51: "🌦️ Light drizzle",
  53: "🌦️ Moderate drizzle",
  55: "🌧️ Dense drizzle",
  56: "🌦️ Light freezing drizzle",
  57: "🌧️ Dense freezing drizzle",
  61: "🌧️ Slight rain",
  63: "🌧️ Moderate rain",
  65: "🌧️ Heavy rain",
  66: "🌧️ Light freezing rain",
  67: "🌧️ Heavy freezing rain",
  71: "🌨️ Slight snow fall",
  73: "🌨️ Moderate snow fall",
  75: "❄️ Heavy snow fall",
  77: "❄️ Snow grains",
  80: "🌧️ Slight rain showers",
  81: "🌧️ Moderate rain showers",
  82: "🌧️ Violent rain showers",
  85: "🌨️ Slight snow showers",
  86: "🌨️ Heavy snow showers",
  95: "⛈️ Thunderstorm",
  96: "⛈️ Thunderstorm with slight hail",
  99: "⛈️ Thunderstorm with heavy hail",
};

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function setLoading(show) {
  loading.classList.toggle("hidden", !show);
}

function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.classList.remove("hidden");
}

function clearError() {
  errorDiv.textContent = "";
  errorDiv.classList.add("hidden");
}

async function fetchWeather(lat, lon, name = "Konumunuz") {
  try {
    setLoading(true);
    clearError();
    weatherCard.classList.add("hidden");

    const url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Hava durumu verisi cekilemedi");

    const data = await res.json();
    const weather = data.current;

    const code = weather.weather_code;
    const weatherText = weatherCodes[code] || "Unknown";

    cityName.textContent = name;
    temperature.textContent = `🌡️ Sicaklik: ${weather.temperature_2m}°C`;
    description.textContent = `${weatherText}\n💨 Ruzgar: ${weather.wind_speed_10m} km/s\n💧 Nem: ${weather.relative_humidity_2m}%`;

    weatherCard.classList.remove("hidden");
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Tarayiciniz konum servisini desteklemiyor.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeather(latitude, longitude, "Konumunuz");
    },
    (err) => {
      if (err.code === 1) showError("Kullanicidan izin alinamadi.");
      else if (err.code === 2) showError("Konum bilgisi mevcut degil.");
      else if (err.code === 3) showError("Konum istegi zaman asimina ugradi.");
      else showError("Konum alinirken hata olustu.");
    }
  );
});

async function searchCity(query) {
  if (!query) return;

  try {
    setLoading(true);
    clearError();
    weatherCard.classList.add("hidden");

    const url = `${GEO_API}?name=${query}&count=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Sehir bulunamadi");

    const data = await res.json();
    if (!data.results || data.results.length === 0) throw new Error("Sehir bulunamadi");

    const city = data.results[0];
    fetchWeather(city.latitude, city.longitude, city.name);
  } catch (err) {
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

const debouncedSearch = debounce((e) => {
  const query = e.target.value.trim();
  if (query.length > 2) {
    searchCity(query);
  }
}, 500);

cityInput.addEventListener("input", debouncedSearch);
