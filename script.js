const apiKey = "c42c02d67e8fefba64ba82ea86c58355";

// Date & Time
function updateDateTime() {
  const now = new Date();
  document.getElementById("dateTime").innerHTML =
    now.toLocaleString();
}

updateDateTime();
setInterval(updateDateTime, 1000);

// Search Weather
async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (city === "") {
    showError("Please enter a city name.");
    return;
  }

  getWeatherByCity(city);
}

// Get Weather By City
async function getWeatherByCity(city) {

  const currentUrl =
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;

  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;

  try {

    const currentResponse = await fetch(currentUrl);
    const currentData = await currentResponse.json();

    if (currentData.cod != 200) {
      showError(currentData.message);
      return;
    }

    displayCurrentWeather(currentData);

    saveRecentSearch(currentData.name);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    displayForecast(forecastData);

  } catch (error) {

    console.log(error);

    showError("Unable to load weather data.");
  }
}

// Current Weather Display
function displayCurrentWeather(data) {

  document.getElementById("weatherResult").innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>

    <img
      class="weather-icon"
      src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
      alt="Weather Icon"
    >

    <div class="weather-info">

      <p>🌡 Temperature: ${Math.round(data.main.temp)} °F</p>

      <p>🤔 Feels Like: ${Math.round(data.main.feels_like)} °F</p>

      <p>☁ Condition: ${data.weather[0].description}</p>

      <p>💧 Humidity: ${data.main.humidity}%</p>

      <p>🌬 Wind Speed: ${Math.round(data.wind.speed)} mph</p>

      <p>📊 Pressure: ${data.main.pressure} hPa</p>

    </div>
  `;
}

// Forecast Display
function displayForecast(data) {

  document.getElementById("forecastTitle").innerHTML =
    "📅 5-Day Forecast";

  const dailyForecasts = data.list.filter(item =>
    item.dt_txt.includes("12:00:00")
  );

  let forecastHTML = "";

  dailyForecasts.forEach(day => {

    const date = new Date(day.dt_txt)
      .toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric"
      });

    forecastHTML += `
      <div class="forecast-card">

        <h3>${date}</h3>

        <img
          src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png"
          alt="Weather Icon"
        >

        <p>🌡 ${Math.round(day.main.temp)} °F</p>

        <p>${day.weather[0].description}</p>

      </div>
    `;
  });

  document.getElementById("forecast").innerHTML =
    forecastHTML;
}

// Current Location Weather
function getLocationWeather() {

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(
      successLocation,
      errorLocation
    );

  } else {

    showError("Geolocation is not supported.");
  }
}

async function successLocation(position) {

  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const currentUrl =
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  const forecastUrl =
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  try {

    const currentResponse = await fetch(currentUrl);
    const currentData = await currentResponse.json();

    displayCurrentWeather(currentData);

    saveRecentSearch(currentData.name);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    displayForecast(forecastData);

  } catch (error) {

    console.log(error);

    showError("Unable to load location weather.");
  }
}

function errorLocation() {

  showError("Location access denied.");
}

// Recent Searches
function saveRecentSearch(city) {

  let searches =
    JSON.parse(localStorage.getItem("recentSearches")) || [];

  searches = searches.filter(item => item !== city);

  searches.unshift(city);

  searches = searches.slice(0, 5);

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(searches)
  );

  displayRecentSearches();
}

function displayRecentSearches() {

  let searches =
    JSON.parse(localStorage.getItem("recentSearches")) || [];

  if (searches.length === 0) {
    return;
  }

  let html =
    "<p><strong>Recent Searches:</strong></p>";

  searches.forEach(city => {

    html += `
      <button
        class="recent-btn"
        onclick="getWeatherByCity('${city}')"
      >
        ${city}
      </button>
    `;
  });

  document.getElementById("recentSearches").innerHTML =
    html;
}

// Error Messages
function showError(message) {

  document.getElementById("weatherResult").innerHTML =
    `<p class="error">${message}</p>`;

  document.getElementById("forecast").innerHTML = "";
}

// Enter Key Search
document.getElementById("cityInput")
.addEventListener("keypress", function(event) {

  if (event.key === "Enter") {
    getWeather();
  }

});

// Dark Mode
document.getElementById("darkModeBtn")
.addEventListener("click", function() {

  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    this.innerHTML = "☀️";
  } else {
    this.innerHTML = "🌙";
  }

});

displayRecentSearches();