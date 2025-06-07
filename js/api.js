// DOM Elements
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const resultsContainer = document.getElementById('results');

// Configuration
const API_KEY = 'AIzaSyBRyCJuEkB3xNR3ycE7HKSgaaOSNZ_npHI';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // First-time CORS proxy activation (may need to visit this manually)
    fetch('https://cors-anywhere.herokuapp.com/corsdemo')
        .catch(() => console.log('Visit https://cors-anywhere.herokuapp.com/corsdemo to activate proxy'));

    // Event Listeners
    searchButton.addEventListener('click', fetchPlaces);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchPlaces();
    });
});

// Main Function
async function fetchPlaces() {
    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        showLoading();

        // Using CORS proxy for search
        const searchUrl = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(city + ' tourist attractions')
            }&key=${API_KEY}`;

        const response = await fetch(`${CORS_PROXY}${searchUrl}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.status !== 'OK') throw new Error(data.error_message || 'API request failed');

        displayResults(data.results || []);
    } catch (error) {
        console.error('API Error:', error);
        showError(`Error: ${error.message}. Please try again later.`);
    }
}

// Display Function with Photo Support
function displayResults(places) {
    resultsContainer.innerHTML = `
        <h2>Top Attractions</h2>
        <div id="attractions-list"></div>
        <div id="google-attribution" style="font-size:11px;color:#666;margin-top:10px;text-align:center">
            Places photos from Google
        </div>
    `;

    const attractionsList = document.getElementById('attractions-list');

    places.slice(0, 5).forEach(place => {
        const card = document.createElement('div');
        card.className = 'attraction-card';

        // Basic info
        card.innerHTML = `
            <h3>${place.name}</h3>
            <p class="address">${place.formatted_address}</p>
            ${place.rating ? `
                <p class="rating">
                    ⭐ ${place.rating}/5 
                    <small>(${place.user_ratings_total || 0} reviews)</small>
                </p>` : ''
            }
        `;

        // Add photo if available (with separate handling)
        if (place.photos?.[0]?.photo_reference) {
            const img = document.createElement('img');
            img.className = 'place-image';
            img.alt = place.name;
            img.loading = 'lazy';

            // Special photo handling - note different approach
            img.src = getPhotoUrl(place.photos[0].photo_reference);

            img.onerror = () => {
                img.style.display = 'none';
                console.log('Failed to load photo for:', place.name);
            };

            card.appendChild(img);
        }

        attractionsList.appendChild(card);
    });
}

// Special function for photo URLs
function getPhotoUrl(photoReference) {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;
}

// Keep your existing helper functions
function showLoading() {
    resultsContainer.innerHTML = `
        <div class="loading">
            <p>Searching for attractions...</p>
            <div class="spinner"></div>
        </div>
    `;
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <p>Please check your connection and try again.</p>
        </div>
    `;
}

function showMessage(message) {
    resultsContainer.innerHTML = `
        <div class="info-message">
            <p>${message}</p>
            <p>Suggestions: Try major cities like Paris, New York, or Tokyo</p>
        </div>
    `;
}