const apiKey = "YOUR_KEY_HERE";

// Function to fetch and display weather data
async function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    alert("Please enter a city");
    return;
  }

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    showLoading(true);

    // Current weather
    const resWeather = await fetch(currentWeatherUrl);
    const dataWeather = await resWeather.json();
    if (!resWeather.ok) {
      const msg = (dataWeather && dataWeather.message) ? dataWeather.message : "Unable to fetch weather";
      displayError(msg);
      return;
    }

    // Hourly forecast
    displayWeather(dataWeather);

    try {
      const resForecast = await fetch(forecastUrl);
      const dataForecast = await resForecast.json();
      if (resForecast.ok && Array.isArray(dataForecast.list)) {
        displayHourlyForecast(dataForecast.list);
      } else {
        console.warn("Forecast not available:", dataForecast);
      }
    } catch (err) {
      console.warn("Forecast fetch failed:", err);
    }

  } catch (err) {
    console.error("Error fetching current weather data:", err);
    alert("Error fetching current weather data. Please try again.");
  } finally {
    showLoading(false);
  }
}

// Functions to update the UI elements with error messages 
function displayError(message) {
  const weatherInfoDiv = document.getElementById("weather-info");
  const tempDivInfo = document.getElementById("temp-div");
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  weatherInfoDiv.innerHTML = `<p>${message}</p>`;
  tempDivInfo.innerHTML = "";
  hourlyForecastDiv.innerHTML = "";
  const weatherIcon = document.getElementById("weather-icon");
  if (weatherIcon) weatherIcon.style.display = "none";
}

// Functions to update the UI elements with data
function displayWeather(data) {
  const tempDivInfo = document.getElementById("temp-div");
  const weatherInfoDiv = document.getElementById("weather-info");
  const weatherIcon = document.getElementById("weather-icon");

  tempDivInfo.innerHTML = "";
  weatherInfoDiv.innerHTML = "";

  const cityName = data.name || "";
  const temperature = Math.round(data.main?.temp ?? 0);
  const description = data.weather && data.weather[0] ? data.weather[0].description : "";
  const iconCode = data.weather && data.weather[0] ? data.weather[0].icon : null;
  const iconUrl = iconCode ? `https://openweathermap.org/img/wn/${iconCode}@4x.png` : "";

  tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;
  weatherInfoDiv.innerHTML = `<p>${cityName}</p><p>${description}</p>`;

  // Update weather icon
  if (iconUrl) {
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    showImage();
  } else {
    weatherIcon.style.display = "none";
  }
}

// Function to display the hourly forecast
function displayHourlyForecast(list) {
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  if (!hourlyForecastDiv) return;
  hourlyForecastDiv.innerHTML = "";
  if (!Array.isArray(list) || list.length === 0) return;

  const next24 = list.slice(0, 8);
  next24.forEach(item => {
    const dateTime = new Date(item.dt * 1000);
    const hour = String(dateTime.getHours()).padStart(2, "0");
    const temp = Math.round(item.main?.temp ?? 0);
    const icon = item.weather && item.weather[0] ? item.weather[0].icon : "";
    const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}.png` : "";

    const div = document.createElement("div");
    div.className = "hourly-item";
    div.innerHTML = `<span>${hour}:00</span><img src="${iconUrl}" alt="icon"><span>${temp}°C</span>`;
    hourlyForecastDiv.appendChild(div);
  });
}

// Function to show the weather icon
function showImage() {
  const weatherIcon = document.getElementById("weather-icon");
  if (!weatherIcon) return;
  weatherIcon.style.display = "block";
  weatherIcon.classList.remove("show");
  setTimeout(() => weatherIcon.classList.add("show"), 50);
}

// Function to show the loading spinner
function showLoading(show) {
  const loader = document.getElementById("loading");
  if (!loader) return;
  loader.style.display = show ? "block" : "none";
}