// Configuration
const API_KEY = 'AIzaSyBRyCJuEkB3xNR3ycE7HKSgaaOSNZ_npHI';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

// List of CORS proxies to try (fallback if one fails)
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://thingproxy.freeboard.io/fetch/',
    'https://cors-anywhere.herokuapp.com/'
];

// Main API Function with proxy rotation
async function fetchPlaces(city) {
    if (!city) throw new Error('Please enter a city name');

    const searchUrl = `${BASE_URL}/textsearch/json?query=${encodeURIComponent(city + ' tourist attractions')
        }&key=${API_KEY}`;

    let lastError;

    // Try each proxy in sequence
    for (const proxy of CORS_PROXIES) {
        try {
            const proxyUrl = proxy === 'https://api.allorigins.win/raw?url='
                ? `${proxy}${encodeURIComponent(searchUrl)}`
                : `${proxy}${searchUrl}`;

            const response = await fetch(proxyUrl, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            });

            if (response.status === 429) {
                lastError = new Error('Too many requests. Please wait a moment.');
                continue;
            }

            if (!response.ok) {
                lastError = new Error(`HTTP error! status: ${response.status}`);
                continue;
            }

            const data = await response.json();
            if (data.status !== 'OK') {
                lastError = new Error(data.error_message || 'API request failed');
                continue;
            }

            return data.results || [];
        } catch (error) {
            lastError = error;
            console.log(`Proxy ${proxy} failed, trying next...`);
        }
    }

    throw lastError || new Error('All proxies failed. Please try again later.');
}

// Photo URL generator with fallbacks
function getPhotoUrl(photoReference) {
    // Try direct URL first (may work in some environments)
    const directUrl = `${BASE_URL}/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;

    // Fallback to first available proxy
    const proxyUrl = `${CORS_PROXIES[0]}${encodeURIComponent(directUrl)}`;

    return proxyUrl;
}