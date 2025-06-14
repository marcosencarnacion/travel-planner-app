// Hero Image Rotation
document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero');
    const imageFolder = 'assets/images/';
    const imageFiles = [
        'santorini-greece.webp',
        'paris-france.webp',
        'tokyo-japan.webp',
        'new-york-usa.webp',
        'bali-indonesia.webp',
        'rome-italy.webp',
        'santo-domingo-dr.webp',
        'bogota-colombia.webp'
    ];

    let currentIndex = 0;
    const changeInterval = 5000; // Change image every 5 seconds

    // Preload images
    function preloadImages() {
        imageFiles.forEach(image => {
            const img = new Image();
            img.src = imageFolder + image;
        });
    }

    // Change hero background image
    function changeHeroImage() {
        heroSection.classList.remove('fade-in');

        // Small timeout to allow the fade-out effect
        setTimeout(() => {
            const imageUrl = `url('${imageFolder}${imageFiles[currentIndex]}')`;
            heroSection.style.backgroundImage = imageUrl;
            heroSection.classList.add('fade-in');

            currentIndex = (currentIndex + 1) % imageFiles.length;
        }, 100);
    }

    // Initialize hero image rotation
    function initHeroRotation() {
        preloadImages();
        changeHeroImage(); // Show first image immediately

        // Set interval for changing images
        setInterval(changeHeroImage, changeInterval);
    }

    initHeroRotation();
});