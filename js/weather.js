document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = '9e07a5ce9d694f92ab602105251406';
    const weatherContainer = document.getElementById('weatherWidget');

    if (weatherContainer) {
        fetchWeather('New York');

        const cityInput = document.getElementById('cityInput');
        if (cityInput) {
            cityInput.addEventListener('search', (e) => {
                fetchWeather(e.target.value);
            });
        }
    }

    async function fetchWeather(city) {
        try {
            const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`);
            const data = await response.json();

            displayWeather(data);
        } catch (error) {
            console.error('Weather fetch error:', error);
            weatherContainer.innerHTML = `<p class="error">Unable to fetch weather for "${city}".</p>`;
        }
    }

    function displayWeather(data) {
        const weatherHTML = `
            <div class="weather-card">
                <h3>${data.location.name}, ${data.location.country}</h3>
                <div class="weather-main">
                    <img src="https:${data.current.condition.icon}" 
                         alt="${data.current.condition.text}">
                    <span class="temp">${Math.round(data.current.temp_c)}°C</span>
                </div>
                <div class="weather-details">
                    <p>${data.current.condition.text}</p>
                    <p>Humidity: ${data.current.humidity}%</p>
                    <p>Wind: ${data.current.wind_kph} kph</p>
                </div>
            </div>
        `;

        weatherContainer.innerHTML = weatherHTML;
    }
});
