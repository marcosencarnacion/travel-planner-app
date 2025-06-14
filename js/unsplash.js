// unsplash.js
document.addEventListener('DOMContentLoaded', () => {
    const ACCESS_KEY = 'xPNraEXz6Oz9vCa2J4HIFTtK9FdEUwb-SxeYmEcZOCs';
    const resultsContainer = document.getElementById('unsplashResults');
    const searchInput = document.getElementById('photoSearch');
    const searchBtn = document.getElementById('searchPhotosBtn');

    // Load default photos on startup
    fetchPhotos('vacation');

    // Setup search
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            fetchPhotos(searchInput.value.trim());
        }
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            fetchPhotos(searchInput.value.trim());
        }
    });

    async function fetchPhotos(query) {
        try {
            resultsContainer.innerHTML = '<div class="loading">Loading photos...</div>';

            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${query}&per_page=12&orientation=landscape&client_id=${ACCESS_KEY}`
            );

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            displayPhotos(data.results);

        } catch (error) {
            console.error('Unsplash error:', error);
            resultsContainer.innerHTML = `<div class="error">Failed to load photos. Try another search.</div>`;
        }
    }

    function displayPhotos(photos) {
        if (!photos.length) {
            resultsContainer.innerHTML = '<div class="no-results">No photos found. Try another search term.</div>';
            return;
        }

        resultsContainer.innerHTML = photos.map(photo => `
            <div class="photo-card">
                <img src="${photo.urls.regular}" 
                     alt="${photo.alt_description || 'Travel photo'}" 
                     loading="lazy">
                <div class="photo-info">
                    <p>Photo by <a href="${photo.user.links.html}?utm_source=Travel_Planner&utm_medium=referral" target="_blank">${photo.user.name}</a></p>
                </div>
            </div>
        `).join('');
    }
});