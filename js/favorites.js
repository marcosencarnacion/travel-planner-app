// Favorites System - Works across all pages
document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_KEY = 'AIzaSyBRyCJuEkB3xNR3ycE7HKSgaaOSNZ_npHI'; // From your api.js

    // Elements
    const viewFavoritesBtn = document.getElementById('viewFavoritesBtn');
    const favoritesModal = document.getElementById('favoritesModal');
    const closeModal = document.querySelector('.close-modal');
    const favoritesList = document.getElementById('favoritesList');

    // State
    let favorites = JSON.parse(localStorage.getItem('travelFavorites')) || [];

    // Initialize modal if elements exist
    if (viewFavoritesBtn && favoritesModal) {
        setupModal();
    }

    // Update favorites count on all pages
    updateFavoritesCount();

    function setupModal() {
        viewFavoritesBtn.addEventListener('click', () => {
            renderFavoritesList();
            favoritesModal.style.display = 'block';
        });

        closeModal.addEventListener('click', () => {
            favoritesModal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === favoritesModal) {
                favoritesModal.style.display = 'none';
            }
        });
    }

    // Render favorites list (works for both modal and gallery)
    window.renderFavoritesList = function (container = favoritesList) {
        if (!container) return;

        container.innerHTML = '';

        if (favorites.length === 0) {
            container.innerHTML = '<p class="no-favorites">No favorites saved yet.</p>';
            return;
        }

        // Sort by most recently added
        const sortedFavorites = [...favorites].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        sortedFavorites.forEach((fav, index) => {
            const favItem = document.createElement('div');
            favItem.className = 'favorite-item';

            favItem.innerHTML = `
                ${fav.photo ? `<img src="${getPhotoUrl(fav.photo)}" alt="${fav.name}" loading="lazy">` : ''}
                <div class="favorite-info">
                    <h4>${fav.name}</h4>
                    <p class="favorite-address">${fav.address}</p>
                    ${fav.rating ? `<p class="favorite-rating">⭐ ${fav.rating}/5</p>` : ''}
                    <button class="remove-favorite" data-index="${favorites.findIndex(f =>
                f.name === fav.name && f.address === fav.address
            )}">Remove</button>
                </div>
            `;

            container.appendChild(favItem);
        });

        // Add event listeners to remove buttons
        container.querySelectorAll('.remove-favorite').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                if (index >= 0) {
                    favorites.splice(index, 1);
                    localStorage.setItem('travelFavorites', JSON.stringify(favorites));
                    renderFavoritesList(container);
                    updateFavoritesCount();

                    // Update save buttons on explore-plan page
                    if (typeof updateSaveButtons === 'function') {
                        updateSaveButtons();
                    }
                }
            });
        });
    };

    // Add favorite button to attraction cards
    window.addFavoriteButton = function (card, place) {
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-favorite-btn';
        saveBtn.innerHTML = '★ <span>Save</span>';

        // Check if already favorited
        const isFavorited = favorites.some(fav =>
            fav.name === place.name &&
            fav.address === place.formatted_address
        );

        if (isFavorited) {
            saveBtn.innerHTML = '✓ <span>Saved</span>';
            saveBtn.classList.add('saved');
        }

        saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveToFavorites(place);
            saveBtn.innerHTML = '✓ <span>Saved!</span>';
            saveBtn.classList.add('saved');
            setTimeout(() => {
                saveBtn.innerHTML = '✓ <span>Saved</span>';
            }, 2000);

            updateFavoritesCount();
        });

        card.appendChild(saveBtn);
    };

    // Update all save buttons state
    window.updateSaveButtons = function () {
        document.querySelectorAll('.save-favorite-btn').forEach(btn => {
            // You might need to associate each button with its place data
            // This is a simplified version - you may need to adapt it
            const card = btn.closest('.attraction-card');
            if (card) {
                const placeName = card.querySelector('h3')?.textContent;
                const isFavorited = favorites.some(fav => fav.name === placeName);

                btn.innerHTML = isFavorited ? '✓ <span>Saved</span>' : '★ <span>Save</span>';
                btn.classList.toggle('saved', isFavorited);
            }
        });
    };

    // Save to favorites
    function saveToFavorites(place) {
        const favorite = {
            name: place.name,
            address: place.formatted_address,
            rating: place.rating,
            photo: place.photos?.[0]?.photo_reference,
            timestamp: new Date().toISOString()
        };

        // Remove if already exists
        favorites = favorites.filter(fav =>
            !(fav.name === favorite.name && fav.address === favorite.address)
        );

        favorites.push(favorite);
        localStorage.setItem('travelFavorites', JSON.stringify(favorites));
    }

    // Helper to update favorites count
    function updateFavoritesCount() {
        const count = favorites.length;
        const countElements = document.querySelectorAll('#favoritesCount, .favorites-count');

        countElements.forEach(el => {
            el.textContent = count > 0 ? `(${count})` : '';
        });
    }

    // Photo URL helper
    function getPhotoUrl(photoReference) {
        return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${API_KEY}`;
    }
});