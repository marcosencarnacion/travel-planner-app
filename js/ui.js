// DOM Elements
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const resultsContainer = document.getElementById('results');

// Rate limiting variables
let lastSearchTime = 0;
const SEARCH_COOLDOWN = 2000; // 2 seconds between searches

// Initialize UI
function initUI() {
    // Event Listeners
    searchButton.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
}

// Search handler with rate limiting
async function handleSearch() {
    const now = Date.now();
    if (now - lastSearchTime < SEARCH_COOLDOWN) {
        showError('Please wait a moment before searching again');
        return;
    }
    lastSearchTime = now;

    const city = cityInput.value.trim();

    try {
        searchButton.classList.add('loading');
        showLoading();

        const places = await fetchPlaces(city);

        if (places.length === 0) {
            showMessage('No attractions found. Try a more popular city.');
        } else {
            displayResults(places);
        }
    } catch (error) {
        console.error('Search Error:', error);
        showError(error.message.includes('failed')
            ? error.message
            : 'Error: ' + error.message);
    } finally {
        searchButton.classList.remove('loading');
    }
}

// Display Functions
function displayResults(places) {
    resultsContainer.innerHTML = `
        <h2>Top Attractions</h2>
        <div id="attractions-list"></div>
        <div class="google-attribution">
            Places photos from Google
        </div>
    `;

    const attractionsList = document.getElementById('attractions-list');

    places.slice(0, 5).forEach(place => {
        attractionsList.appendChild(createPlaceCard(place));
    });
}

function createPlaceCard(place) {
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

    // Add photo if available
    if (place.photos?.[0]?.photo_reference) {
        const img = document.createElement('img');
        img.className = 'place-image';
        img.alt = place.name;
        img.loading = 'lazy';
        img.src = getPhotoUrl(place.photos[0].photo_reference);
        img.onerror = () => {
            img.style.display = 'none';
            console.log('Failed to load photo for:', place.name);
        };
        card.appendChild(img);
    }

    return card;
}

// UI Helper Functions
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