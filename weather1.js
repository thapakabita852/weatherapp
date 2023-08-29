const API_KEY = "6f2316d8d67d4269d4c8425345314a92";

async function searchHandler() {
  const value = document.querySelector(".input-box").value;
  const storedDataKey = value.toLowerCase(); // Convert to lowercase for consistency

  console.log("Searching for:", storedDataKey);

  const isOnline = navigator.onLine;

  if (isOnline) {
    if (checkLocalStorage(storedDataKey)) {
      console.log("Data Accessed from Local Storage");
      localDataDisplay(storedDataKey); //
      showHistory(storedDataKey);
    } else {
      console.log("Data Accessed from Internet");
      await weatherApi(storedDataKey);
    }
  } else {
    if (checkLocalStorage(storedDataKey)) {
      console.log("Data Accessed from Local Storage (Offline)");
      localDataDisplay(storedDataKey); // Display history data for the city "New York"
    } else {
      console.log("No Internet Connection");
      alert("You are offline. Local data not found.");
    }
  }
}

// Fetch weather api
const weatherApi = async (city) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    const historyDiv = document.getElementById("historyData");
    historyDiv.innerHTML = " "; // Clear previous history

    const weather_img = document.querySelector(".weather-img");
    document.querySelector(".location-not-found").style.display = "none";
    document.querySelector(".weather-body").style.display = "flex";

    if (data.cod === "404") {
      document.querySelector(".location-not-found").style.display = "flex";
      document.querySelector(".weather-body").style.display = "none";
    }

    document.querySelector(".city").innerHTML = data.name;
    document.querySelector(".temperature").innerHTML = data.main.temp;
    document.querySelector("#humidity").innerHTML = data.main.humidity + "%";
    document.querySelector("#wind-speed").innerHTML = data.wind.speed + "km/h";
    document.querySelector(
      ".description"
    ).innerHTML = `${data.weather[0].description}`;
    document.querySelector("#pressure").innerHTML = data.main.pressure + " hPa";

    switch (data.weather[0].main) {
      case "Clouds":
        weather_img.src = "image/cloud.png";
        break;
      case "Clear":
        weather_img.src = "image/clear.png";
        break;
      case "Rain":
        weather_img.src = "image/rain.png";
        break;
      case "Mist":
        weather_img.src = "image/mist.png";
        break;
      case "Snow":
        weather_img.src = "image/snow.png";
        break;
    }

    // Save current weather data to the database
    const weatherData = {
      city: data.name,
      temperature: data.main.temp,
      wind: data.wind.speed,
      pressure: data.main.pressure,
      humidity: data.main.humidity,
      description: data.weather[0].description,
    };

    saveWeatherData(weatherData);

    // Save current weather data to local storage
    appendToLocalStorage(storedDataKey, weatherData);

    // Display history data for the searched city
    if (!isOnline) {
      console.log("No Internet Connection");
    }
  } catch (err) {
    console.error(err);
  }
};
// Handler for Show History button click
function showHistoryHandler() {
  const value = document.querySelector(".input-box").value;
  const storedDataKey = value.toLowerCase(); // Convert to lowercase for consistency
  // const value = document.querySelector(".city").innerHTML; // Use the city name displayed on the page
  showHistory(storedDataKey);
}

// Function to fetch and display weather history for a city
const showHistory = async (city) => {
  try {
    const response = await fetch(`get_history.php?city=${city}`);
    const historyData = await response.json();

    const historyDiv = document.getElementById("historyData");
    historyDiv.innerHTML = " "; // Clear previous history

    historyData.forEach((history) => {
      const historyBox = document.createElement("div");
      historyBox.classList.add("history-box");

      const historyEntry = `
        <div class="history-entry" style="border: 2px solid black; margin-bottom: 10px; background-color: #56d6db; align-item: center; text-align: center;">
          <img class="history-img" style="width: 60%; align-item: center;" src="${getHistoryImage(
            history.description
          )}" alt="Weather Image">
          <p>Date: ${history.date}</p>
          <p>Temperature: ${history.temperature}°C</p>
          <p>Description: ${history.description}</p>
          <br><br><br><br>
        </div>
      `;

      historyBox.innerHTML = historyEntry;
      historyDiv.appendChild(historyBox);
    });

    // Log the data source for history
    console.log("Data Accessed from database");
  } catch (err) {
    console.error(err);
  }
};

// Function to get history weather image based on description
const getHistoryImage = (description) => {
  console.log("History Description:", description); // Debugging
  switch (description) {
    case "Clouds":
      return "image/cloud.png";
    case "overcast clouds":
      return "image/overcast cloud.jpg";
    case "broken clouds":
      return "image/cloud.png";
    case "clear sky":
      return "image/clear.png";
    case "Clear Sky":
      return "image/clear.png";
    case "shower rain":
      return "image/rain.png";
    case "moderate rain":
      return "image/moderate rain.png";
    case "Moderate Rain":
      return "image/rain.png";
    case "Mist":
      return "image/mist.png";
    case "Snow":
      return "image/snow.png";
    default:
      return "image/mist.png"; // Replace with your default image path
  }
};

// Function to save data to local storage
const saveToLocalStorage = (key, storedDataKey) => {
  localStorage.setItem(key, JSON.stringify(storedDataKey));
};

// Function to retrieve data from local storage
const getFromLocalStorage = (key) => {
  const storedData = localStorage.getItem(key);
  return JSON.parse(storedData);
};

// Function to check if data exists in local storage
const checkLocalStorage = (key) => {
  return localStorage.getItem(key) !== null;
};

// Function to append new data to existing local storage
const appendToLocalStorage = (key, newData) => {
  const storedData = getFromLocalStorage(key) || [];
  storedData.push(newData);
  saveToLocalStorage(key, storedData);
};

// Updated saveWeatherData function
const saveWeatherData = async (data) => {
  const storedDataKey = data.city.toLowerCase(); // Convert to lowercase for consistency
  appendToLocalStorage(storedDataKey, data);

  try {
    const response = await fetch("save_weather.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    const result = await response.text();
    console.log(result);
  } catch (err) {
    console.error(err);
  }
};

// Function to get weather data from local storage
const getWeatherData = (city) => {
  const storedDataKey = city.toLowerCase(); // Convert to lowercase for consistency
  return getFromLocalStorage(storedDataKey);
};

// Get the current date
const currentDate = new Date();

// Format the date as desired (e.g., "January 1, 2022")
const formattedDate = currentDate.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

// Display the date in the app
const dateElement = document.getElementById("current-date");
dateElement.textContent = formattedDate;
const data = weatherApi("torbay");
// Function to display weather history data from local storage
const localDataDisplay = (city) => {
  const storedData = getFromLocalStorage(city);
  const historyDataElement = document.getElementById("historyData");
  const weatherBody = document.querySelector(".weather-body");

  if (storedData) {
    const latestData = storedData[0];
    const historyImage = getHistoryImage(latestData.description);
    const today = new Date();
    const currentDate = today.toISOString().split("T")[0];

    const weather_img = document.querySelector(".weather-img");
    document.querySelector(".location-not-found").style.display = "none";
    document.querySelector(".weather-body").style.display = "flex";

    if (data.cod === "404") {
      document.querySelector(".location-not-found").style.display = "flex";
      document.querySelector(".weather-body").style.display = "none";
    }

    document.querySelector(".city").innerHTML = city;
    document.querySelector(".temperature").innerHTML = latestData.temperature;
    document.querySelector("#humidity").innerHTML = latestData.humidity + "%";
    document.querySelector("#wind-speed").innerHTML = latestData.wind + "km/h";
    document.querySelector("#pressure").innerHTML = latestData.pressure + "hPa";

    let historyDataHTML = "<ul>";
    historyDataHTML += "</ul>";
    historyDataElement.innerHTML = historyDataHTML;
  } else {
    weatherBody.innerHTML = "No history data available for this city.";
    historyDataElement.innerHTML = "";
  }
};

// Attach searchHandler function to the search button's click event
const searchButton = document.getElementById("searchBtn");
searchButton.addEventListener("click", searchHandler);

// Attach searchHandler function to the Enter key press event on the input field
const cityInput = document.querySelector(".input-box");
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    searchHandler();
  }
});