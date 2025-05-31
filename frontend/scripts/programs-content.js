document.addEventListener('DOMContentLoaded', () => {
    const heroTitleElement = document.getElementById('programs-page-hero-title');
    const heroParagraphElement = document.getElementById('programs-page-hero-paragraph');
    const programGridElement = document.getElementById('program-grid');
    const API_BASE_URL = "/api"; // Assuming functions are served under /api path

    // Removed initializeCosmosClientsProgramsPage function

    // Fetch and Display Programs Page Hero Content
    async function displayProgramsPageHero() {
        if (!heroTitleElement || !heroParagraphElement) {
            console.error("Programs page hero elements not found in DOM.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/programs_page`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const item = await response.json();

            // The API for programs_page-get is designed to return a default object if not found,
            // or the actual item.
            heroTitleElement.textContent = item.heroTitle || "Our Programs";
            heroParagraphElement.textContent = item.heroParagraph || "Explore our comprehensive range of healthcare education programs";

        } catch (error) {
            console.error("Error fetching programs page hero content from API:", error);
            heroTitleElement.textContent = "Error Loading Title";
            heroParagraphElement.textContent = "Could not load description. Please try again.";
        }
    }

    // Fetch and Display Program Cards
    async function displayProgramCards() {
        if (!programGridElement) {
            console.error("Program grid element not found in DOM.");
            return;
        }
        programGridElement.innerHTML = '<div class="program-card-placeholder"><p>Loading programs...</p></div>';

        try {
            const response = await fetch(`${API_BASE_URL}/programs`);
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
            }
            const items = await response.json();

            if (!items || items.length === 0) {
                programGridElement.innerHTML = '<p>No programs available at the moment. Please check back later.</p>';
                return;
            }

            programGridElement.innerHTML = ''; // Clear loading message

            items.forEach(item => {
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('program-card');

                const img = document.createElement('img');
                img.src = item.imageUrl || 'frontend/images/placeholder-program.jpg';
                img.alt = item.title || 'Program image';
                img.loading = 'lazy';
                img.onerror = function() { this.src = 'https://placehold.co/300x200/ff0000/ffffff?text=Image+Error'; };


                const contentDiv = document.createElement('div');
                contentDiv.classList.add('program-content');

                const h3 = document.createElement('h3');
                h3.textContent = item.title || 'Untitled Program';

                const p = document.createElement('p');
                p.textContent = item.description || 'No description available.';

                const footerDiv = document.createElement('div');
                footerDiv.classList.add('program-footer');

                const durationSpan = document.createElement('span');
                durationSpan.classList.add('duration');
                durationSpan.innerHTML = `<i class="far fa-clock"></i> ${item.duration || 'N/A'}`;

                const linkA = document.createElement('a');
                let programLink = item.linkUrl || '#';
                // Logic for constructing correct program link (relative to current page or absolute)
                // This assumes linkUrl might be like "program-name.html" and needs to be in "programs/" folder
                if (!programLink.startsWith('http') && !programLink.startsWith('/') && !programLink.startsWith('programs/')) {
                     if (!programLink.includes('/')) {
                         programLink = `programs/${programLink}`;
                     }
                }


                linkA.href = programLink;
                linkA.classList.add('btn');
                linkA.textContent = 'Learn More';

                footerDiv.appendChild(durationSpan);
                footerDiv.appendChild(linkA);

                contentDiv.appendChild(h3);
                contentDiv.appendChild(p);
                contentDiv.appendChild(footerDiv);

                cardDiv.appendChild(img);
                cardDiv.appendChild(contentDiv);

                programGridElement.appendChild(cardDiv);
            });

        } catch (error) {
            console.error("Error fetching program cards from API:", error);
            programGridElement.innerHTML = '<p class="error-message">Error loading programs. Please try refreshing the page.</p>';
        }
    }

    // Call functions to display content
    // No explicit SDK client initialization needed here anymore
    displayProgramsPageHero();
    displayProgramCards();
});
