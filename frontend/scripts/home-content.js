document.addEventListener('DOMContentLoaded', () => {
    // Ensure Firebase is initialized (it should be by firebase-config.js)
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("Firebase not initialized. Make sure firebase-config.js is loaded before this script.");
        // Display a user-friendly message or use a placeholder
        const heroSliderContainer = document.getElementById('hero-slider');
        if (heroSliderContainer) {
            heroSliderContainer.innerHTML = `
                <div class="slide active">
                    <img src="frontend/images/placeholder-error.jpg" alt="Error loading content" loading="lazy">
                    <div class="slide-content">
                        <h1>Error</h1>
                        <p>Could not load dynamic content. Please check your connection or try again later.</p>
                    </div>
                </div>`;
        }
        // Hide slider controls if Firebase fails
        const sliderControls = document.querySelector('.slider-controls');
        if (sliderControls) sliderControls.style.display = 'none';
        return;
    }

    const db = firebase.firestore();
    const heroCollection = db.collection('hero_section');

    const heroSliderContainer = document.getElementById('hero-slider');
    const sliderDotsContainer = document.getElementById('slider-dots');

    async function displayHeroSlides() {
        if (!heroSliderContainer || !sliderDotsContainer) {
            console.error("Hero slider or dots container not found in the DOM.");
            return;
        }

        try {
            const snapshot = await heroCollection.orderBy('order', 'asc').get();

            if (snapshot.empty) {
                console.log("No hero slides found in Firestore.");
                heroSliderContainer.innerHTML = `
                <div class="slide active">
                    <img src="frontend/images/placeholder-empty.jpg" alt="No slides available" loading="lazy">
                    <div class="slide-content">
                        <h1>Content Coming Soon</h1>
                        <p>Check back later for exciting updates!</p>
                    </div>
                </div>`;
                sliderDotsContainer.innerHTML = ''; // No dots if no slides
                 // Hide slider controls if no slides
                const controls = document.querySelector('.slider-controls');
                if (controls) controls.style.display = 'none';
                return;
            }

            heroSliderContainer.innerHTML = ''; // Clear existing placeholder/static slides
            sliderDotsContainer.innerHTML = ''; // Clear existing placeholder/static dots

            let slideIndex = 0;
            snapshot.forEach(doc => {
                const data = doc.data();

                // Create slide element
                const slideDiv = document.createElement('div');
                slideDiv.classList.add('slide');
                if (slideIndex === 0) {
                    slideDiv.classList.add('active');
                }

                const img = document.createElement('img');
                img.src = data.imageUrl || 'frontend/images/Place-Holder-Hero.webp'; // Fallback image
                img.alt = data.heading || 'Hero slide image'; // Use heading for alt text
                img.loading = 'lazy';

                const slideContentDiv = document.createElement('div');
                slideContentDiv.classList.add('slide-content');

                const h1 = document.createElement('h1');
                h1.textContent = data.heading || 'Default Heading';

                const p = document.createElement('p');
                p.textContent = data.paragraph || 'Default paragraph text.';

                const a = document.createElement('a');
                a.href = data.buttonUrl || '#';
                a.classList.add('btn', 'btn-primary');
                a.textContent = data.buttonText || 'Learn More';

                slideContentDiv.appendChild(h1);
                slideContentDiv.appendChild(p);
                slideContentDiv.appendChild(a);

                slideDiv.appendChild(img);
                slideDiv.appendChild(slideContentDiv);
                heroSliderContainer.appendChild(slideDiv);

                // Create dot element
                const dotSpan = document.createElement('span');
                dotSpan.classList.add('dot');
                if (slideIndex === 0) {
                    dotSpan.classList.add('active');
                }
                dotSpan.setAttribute('data-index', slideIndex.toString());
                sliderDotsContainer.appendChild(dotSpan);

                slideIndex++;
            });
            
            // Re-initialize the slider logic from index.html's script
            // This assumes `initializeSlider` is globally available or properly scoped
            if (typeof initializeSlider === 'function') {
                const dynamicSlides = heroSliderContainer.querySelectorAll('.slide');
                const dynamicDots = sliderDotsContainer.querySelectorAll('.dot');
                initializeSlider(dynamicSlides, dynamicDots);
                // Make controls visible if previously hidden
                const controls = document.querySelector('.slider-controls');
                if (controls) controls.style.display = ''; 
            } else {
                console.error("initializeSlider function is not defined. Slider will not work dynamically.");
            }

        } catch (error) {
            console.error("Error fetching hero slides:", error);
            heroSliderContainer.innerHTML = `
                <div class="slide active">
                     <img src="frontend/images/placeholder-error.jpg" alt="Error loading content" loading="lazy">
                    <div class="slide-content">
                        <h1>Error Fetching Slides</h1>
                        <p>There was an issue retrieving content. Please try refreshing the page.</p>
                    </div>
                </div>`;
            // Hide slider controls on error
            const controls = document.querySelector('.slider-controls');
            if (controls) controls.style.display = 'none';
        }
    }

    // Call the function to display hero slides
    displayHeroSlides();
});