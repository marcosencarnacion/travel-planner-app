// DOM Elements
const searchButton = document.getElementById('searchButton');
const cityInput = document.getElementById('cityInput');
const resultsContainer = document.getElementById('results');
const ratingFilter = document.getElementById('rating-filter');
const localityFilter = document.getElementById('locality-filter');
const sortBy = document.getElementById('sort-by');

// App State
let allPlaces = [];
let lastSearchTime = 0;
const SEARCH_COOLDOWN = 2000; // 2 seconds between searches

// Initialize UI
function initUI() {
    // Event Listeners
    searchButton.addEventListener('click', handleSearch);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });

    // Filter event listeners
    ratingFilter.addEventListener('change', applyFilters);
    localityFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);
}

// Search handler
async function handleSearch() {
    const now = Date.now();
    if (now - lastSearchTime < SEARCH_COOLDOWN) {
        showError('Please wait a moment before searching again');
        return;
    }
    lastSearchTime = now;

    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    try {
        searchButton.classList.add('loading');
        showLoading();

        const places = await fetchPlaces(city);
        allPlaces = places; // Store all places for filtering

        if (places.length === 0) {
            showMessage('No attractions found. Try a more popular city.');
        } else {
            updateLocalityFilter(places);
            applyFilters(); // Apply default filters
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

// Update locality filter options
function updateLocalityFilter(places) {
    const localities = new Set();

    // Extract localities from formatted_address
    places.forEach(place => {
        if (place.formatted_address) {
            const addressParts = place.formatted_address.split(',');
            if (addressParts.length > 1) {
                const locality = addressParts[addressParts.length - 2].trim();
                if (locality) localities.add(locality);
            }
        }
    });

    // Clear existing options (keeping the first "All Areas" option)
    while (localityFilter.options.length > 1) {
        localityFilter.remove(1);
    }

    // Add new options sorted alphabetically
    Array.from(localities).sort().forEach(locality => {
        const option = document.createElement('option');
        option.value = locality;
        option.textContent = locality;
        localityFilter.appendChild(option);
    });
}

// Apply filters to places
function applyFilters() {
    if (allPlaces.length === 0) return;

    const minRating = parseFloat(ratingFilter.value);
    const locality = localityFilter.value;
    const sortOption = sortBy.value;

    // Filter the places
    let filteredPlaces = [...allPlaces];

    // Apply rating filter
    if (minRating > 0) {
        filteredPlaces = filteredPlaces.filter(place => {
            return place.rating && place.rating >= minRating;
        });
    }

    // Apply locality filter
    if (locality) {
        filteredPlaces = filteredPlaces.filter(place => {
            return place.formatted_address && place.formatted_address.includes(locality);
        });
    }

    // Apply sorting
    filteredPlaces.sort((a, b) => {
        const aRating = a.rating || 0;
        const bRating = b.rating || 0;
        const aReviews = a.user_ratings_total || 0;
        const bReviews = b.user_ratings_total || 0;

        switch (sortOption) {
            case 'rating-desc': return bRating - aRating;
            case 'rating-asc': return aRating - bRating;
            case 'reviews-desc': return bReviews - aReviews;
            default: return 0;
        }
    });

    displayResults(filteredPlaces);
}

// Display results
function displayResults(places) {
    resultsContainer.innerHTML = `
        <h2>Top Attractions ${places.length ? `(${places.length} found)` : ''}</h2>
        <div id="attractions-list"></div>
        <div class="google-attribution">
            Places data from Google Places API
        </div>
    `;

    const attractionsList = document.getElementById('attractions-list');

    if (places.length === 0) {
        attractionsList.innerHTML = '<p class="no-results">No attractions match your filters. Try adjusting your criteria.</p>';
        return;
    }

    places.forEach(place => {
        attractionsList.appendChild(createPlaceCard(place));
    });
}

// Create place card
function createPlaceCard(place) {
    const card = document.createElement('div');
    card.className = 'attraction-card';

    // Basic info
    card.innerHTML = `
        <h3>${place.name}</h3>
        <p class="address">${place.formatted_address || 'Address not available'}</p>
        ${place.rating ? `
            <p class="rating">
                ⭐ ${place.rating.toFixed(1)}/5 
                <small>(${place.user_ratings_total?.toLocaleString() || 0} reviews)</small>
            </p>` : '<p class="rating">Rating not available</p>'
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
        <div class="no-results">
            <p>${message}</p>
            <p>Suggestions: Try major cities like Paris, New York, or Tokyo</p>
        </div>
    `;
}