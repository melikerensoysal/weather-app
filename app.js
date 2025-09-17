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

    const url = `${WEATHER_API}?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Hava durumu verisi cekilemedi");

    const data = await res.json();
    const weather = data.current_weather;

    cityName.textContent = name;
    temperature.textContent = `Sicaklik: ${weather.temperature}°C`;
    description.textContent = `Ruzgar Hizi: ${weather.windspeed} km/s`;

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

cityInput.addEventListener("keyup", async (e) => {
  if (e.key === "Enter") {
    const query = cityInput.value.trim();
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
});