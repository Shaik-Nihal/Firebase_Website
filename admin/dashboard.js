document.addEventListener('DOMContentLoaded', () => {
    // MSAL Configuration (should be consistent with auth.js)
    // Ideally, this config would be shared, but for simplicity in separate files:
    const MSAL_CONFIG = {
        auth: {
            clientId: "YOUR_B2C_APPLICATION_CLIENT_ID", // Replace with actual Client ID
            authority: "https://YOUR_B2C_TENANT_NAME.b2clogin.com/YOUR_B2C_TENANT_NAME.onmicrosoft.com/YOUR_SIGN_UP_SIGN_IN_POLICY_NAME", // Replace
            knownAuthorities: ["YOUR_B2C_TENANT_NAME.b2clogin.com"], // Replace
            redirectUri: window.location.origin + "/admin/index.html", // Main login redirect
            postLogoutRedirectUri: window.location.origin + "/admin/index.html"
        },
        cache: {
            cacheLocation: "sessionStorage",
            storeAuthStateInCookie: false,
        }
    };

    const LOGOUT_REQUEST = {
        // postLogoutRedirectUri: MSAL_CONFIG.auth.postLogoutRedirectUri, // Optional: Define here or rely on config
        // mainWindowRedirectUri: MSAL_CONFIG.auth.postLogoutRedirectUri // For popup logout
    };

    const msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);

    const logoutButton = document.getElementById('logout-button');
    const loginError = document.getElementById('login-error'); // Assuming one exists or might be added for general messages

    function displayDashboardError(message) {
        // You might want a dedicated error display on the dashboard
        console.error("Dashboard Error:", message);
        alert(message); // Simple alert for now
    }

    // Function to handle logout
    function logout() {
        const account = msalInstance.getActiveAccount();
        if (account) {
            LOGOUT_REQUEST.account = account; // Specify which account to log out
        }
        msalInstance.logoutRedirect(LOGOUT_REQUEST).catch(error => {
            console.error("Logout redirect error:", error);
            displayDashboardError("Logout failed. See console for details.");
        });
        // Or use logoutPopup:
        // msalInstance.logoutPopup(LOGOUT_REQUEST).catch(e => console.error(e));
    }

    // Attach logout function to the logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    } else {
        console.warn("Logout button not found on dashboard.html.");
    }

    // Auth check for dashboard
    function checkAuthState() {
        const currentAccounts = msalInstance.getAllAccounts();
        if (currentAccounts === null || currentAccounts.length === 0) {
            // No user signed in
            console.log("Dashboard: No active MSAL account found. Redirecting to login.");
            window.location.href = 'index.html';
        } else if (currentAccounts.length > 0) {
            // User is signed in
            msalInstance.setActiveAccount(currentAccounts[0]);
            console.log("Dashboard: User is signed in. Account:", currentAccounts[0]);
            // Proceed to load dashboard content
            initializeDashboardContent();
        }
    }

    // Handle redirect promise (e.g. if dashboard.html itself is a redirect URI for some flow)
    // For now, main redirection is to index.html, so this is more of a safety check or for future use.
    msalInstance.handleRedirectPromise()
        .then((response) => {
            if (response) {
                msalInstance.setActiveAccount(response.account);
                console.log("Dashboard: Handled redirect response. Account:", response.account);
            }
            checkAuthState(); // Perform auth check after handling potential redirect
        })
        .catch(err => {
            console.error("Dashboard redirect promise error:", err);
            displayDashboardError("Error during authentication processing on dashboard.");
            // Fallback to basic auth check if redirect handling fails for some reason
            checkAuthState();
        });


    // API Endpoints
    const API_BASE_URL = "/api"; // Assuming functions are served under /api path

    // Helper function for generating UUIDs (still needed client-side for new items)
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Function to encapsulate all content loading
    function initializeDashboardContent() {
        // No SDK initializations needed here anymore for Cosmos or Blob directly
        console.log("Initializing dashboard content by fetching data from APIs...");

        loadHeroSlides();
        loadProgramsHeroContent();
        loadProgramCards();

        // Setup image previews (this is local DOM manipulation, so it stays)
        setupImagePreview(heroImageUploadInput, heroImagePreview);
        setupImagePreview(programImageUploadInput, programImagePreview);
    }

    // Hero Section Management Elements
    const heroForm = document.getElementById('hero-form');
    const heroFormTitle = document.getElementById('hero-form-title');
    const heroSlideIdInput = document.getElementById('hero-slideId');
    const heroImageUploadInput = document.getElementById('hero-image-upload');
    const heroImagePreview = document.getElementById('hero-image-preview');
    const heroHeadingInput = document.getElementById('hero-heading');
    const heroParagraphInput = document.getElementById('hero-paragraph');
    const heroButtonTextInput = document.getElementById('hero-button-text');
    const heroButtonUrlInput = document.getElementById('hero-button-url');
    const heroOrderInput = document.getElementById('hero-order');
    const heroSaveButton = document.getElementById('hero-save-button');
    const heroCancelEditButton = document.getElementById('hero-cancel-edit-button');
    const heroSlidesList = document.getElementById('hero-slides-list');
    const heroFormError = document.getElementById('hero-form-error');
    const heroFormSuccess = document.getElementById('hero-form-success');
    const heroFormStatus = document.createElement('p'); // For image upload status, or use existing success/error
    heroFormStatus.style.display = 'none';
    heroForm.appendChild(heroFormStatus); // Add it to the form


    // Function to display messages
    function showMessage(element, message, isSuccess = false) {
        if (!element) return;
        element.textContent = message;
        element.style.display = 'block';
        element.className = isSuccess ? 'success-message' : 'error-message';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }

    // Reset Hero Form
    function resetHeroForm() {
        if (heroForm) heroForm.reset();
        if (heroSlideIdInput) heroSlideIdInput.value = '';
        if (heroFormTitle) heroFormTitle.textContent = 'Add New Hero Slide';
        if (heroSaveButton) heroSaveButton.textContent = 'Save Slide';
        if (heroCancelEditButton) heroCancelEditButton.style.display = 'none';
        if(heroImageUploadInput) heroImageUploadInput.value = null;
        if(heroImagePreview) {
            heroImagePreview.src = '#';
            heroImagePreview.style.display = 'none';
        }
    }

    // Image Preview Logic
    function setupImagePreview(fileInput, previewElement) {
        if (fileInput && previewElement) {
            fileInput.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        previewElement.src = e.target.result;
                        previewElement.style.display = 'block';
                    }
                    reader.readAsDataURL(file);
                } else {
                    previewElement.src = '#';
                    previewElement.style.display = 'none';
                }
            });
        }
    }

    // Removed direct Azure Blob Storage upload function. Will use API.

    // Load Hero Slides
    async function loadHeroSlides() {
        if (!heroSlidesList) return;
        heroSlidesList.innerHTML = '<li class="list-item-placeholder">Loading slides...</li>';

        try {
            const response = await fetch(`${API_BASE_URL}/hero_slides`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
            }
            const items = await response.json();

            if (!items || items.length === 0) {
                heroSlidesList.innerHTML = '<li class="list-item-placeholder">No slides found. Add one using the form.</li>';
                return;
            }

            heroSlidesList.innerHTML = ''; // Clear list
            items.forEach(slide => {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-id', slide.id);
                listItem.innerHTML = `
                    <div class="slide-info">
                        <h4>${slide.heading} (Order: ${slide.order})</h4>
                        <p>${slide.paragraph.substring(0, 50)}...</p>
                        ${slide.imageUrl ? `<img src="${slide.imageUrl}" alt="${slide.heading}" style="width: 100px; height: auto; margin-top: 5px;">` : ''}
                    </div>
                    <div class="slide-actions">
                        <button class="btn btn-sm btn-edit">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete">Delete</button>
                    </div>
                `;
                heroSlidesList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error loading hero slides:", error);
            heroSlidesList.innerHTML = '<li class="list-item-placeholder error-message">Error loading slides. Check console.</li>';
            showMessage(heroFormError, "Error loading slides: " + error.message);
        }
    }

    // Handle Hero Form Submission
    if (heroForm) {
        heroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Auth check is now page-level via MSAL. If on this page, user is authenticated.

            const slideId = heroSlideIdInput.value;
            const heading = heroHeadingInput.value;
            const paragraph = heroParagraphInput.value;
            const buttonText = heroButtonTextInput.value;
            const buttonUrl = heroButtonUrlInput.value;
            const order = parseInt(heroOrderInput.value, 10);
            // const imageUrl = heroImageUrlInput.value.trim(); // REMOVED

            if (!heading || !paragraph || !buttonText || !buttonUrl || isNaN(order)) {
                showMessage(heroFormError, "Please fill in all required fields and ensure order is a number.");
                return;
            }
            
            heroSaveButton.disabled = true;
            heroSaveButton.textContent = slideId ? "Updating..." : "Saving...";
            showMessage(heroFormSuccess, ""); // Clear previous success
            showMessage(heroFormError, "");   // Clear previous error
            showMessage(heroFormSuccess, ""); // Clear previous success

            let imageUrl = null;
            const imageFile = heroImageUploadInput.files[0];
            let existingImageUrl = null;
            // To get existingImageUrl if editing and no new file is chosen,
            // we would need to fetch the item first, or the client stores it.
            // For simplicity, if no new image, current imageUrl on item (if any) is sent back.
            // The API PUT should handle preserving it if not provided in body.
            // However, our current client-side logic for edit populates the preview.
            // We'll fetch it if editing.
            if (slideId && !imageFile) {
                 try {
                    const response = await fetch(`${API_BASE_URL}/hero_slides/${slideId}`); // Assuming a GET by ID endpoint exists or is added
                    if (response.ok) {
                        const currentSlide = await response.json();
                        existingImageUrl = currentSlide.imageUrl;
                    } else { // if GET by ID is not implemented, this won't work.
                        // Alternative: if heroImagePreview.src is set and not a data URL, use it.
                        if (heroImagePreview.src && !heroImagePreview.src.startsWith('data:') && heroImagePreview.src !== '#') {
                            existingImageUrl = heroImagePreview.src;
                        }
                    }
                 } catch (e) { console.warn("Could not fetch existing image URL for edit.", e); }
            }


            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                try {
                    showMessage(heroFormStatus, "Uploading image via API...", true);
                    const uploadResponse = await fetch(`${API_BASE_URL}/upload_image`, {
                        method: 'POST',
                        body: formData
                    });
                    if (!uploadResponse.ok) {
                        const errorBody = await uploadResponse.text();
                        throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorBody}`);
                    }
                    const uploadResult = await uploadResponse.json();
                    imageUrl = uploadResult.imageUrl;
                    showMessage(heroFormStatus, "Image uploaded successfully via API.", true);
                } catch (uploadError) {
                    showMessage(heroFormError, "Image upload failed: " + uploadError.message, false);
                    heroSaveButton.disabled = false;
                    heroSaveButton.textContent = slideId ? "Update Slide" : "Save Slide";
                    return;
                }
            } else if (slideId && existingImageUrl) {
                 imageUrl = existingImageUrl;
            }

            const slideData = {
                heading,
                paragraph,
                buttonText,
                buttonUrl,
                order,
                imageUrl: imageUrl,
                updatedAt: new Date().toISOString()
            };

            try {
                let response;
                if (slideId) {
                    slideData.id = slideId;
                    response = await fetch(`${API_BASE_URL}/hero_slides/${slideId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(slideData)
                    });
                } else {
                    slideData.id = generateUUID(); // Client generates ID for new items
                    slideData.createdAt = new Date().toISOString();
                    response = await fetch(`${API_BASE_URL}/hero_slides`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(slideData)
                    });
                }

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Failed to save slide: ${response.status} - ${errorBody}`);
                }

                const savedItem = await response.json();
                showMessage(heroFormSuccess, `Slide ${slideId ? 'updated' : 'added'} successfully!`, true);
                resetHeroForm();
                loadHeroSlides();

            } catch (error) {
                console.error("Error saving hero slide:", error);
                showMessage(heroFormError, "Error saving slide: " + error.message);
            } finally {
                heroSaveButton.disabled = false;
                heroSaveButton.textContent = slideId ? "Update Slide" : "Save Slide";
                 if (slideId) { // If it was an edit, reset form to "Add New" mode
                    resetHeroForm();
                }
            }
        });
    }

    // Handle Edit/Delete clicks on Hero Slides List
    if (heroSlidesList) {
        heroSlidesList.addEventListener('click', async (e) => {
            const target = e.target;
            const listItem = target.closest('li');
            if (!listItem) return;
            const slideId = listItem.getAttribute('data-id');

            if (target.classList.contains('btn-edit')) {
                if (!slideId) return;
                try {
                    const response = await fetch(`${API_BASE_URL}/hero_slides`); // Fetch all to find the one, or implement GET by ID
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const slides = await response.json();
                    const slide = slides.find(s => s.id === slideId); // Find by id

                    if (slide) {
                        heroFormTitle.textContent = 'Edit Hero Slide';
                        heroSlideIdInput.value = slide.id;
                        heroHeadingInput.value = slide.heading || '';
                        heroParagraphInput.value = slide.paragraph || '';
                        heroButtonTextInput.value = slide.buttonText || '';
                        heroButtonUrlInput.value = slide.buttonUrl || '';
                        heroOrderInput.value = slide.order || 1;
                        // heroImageUrlInput.value = slide.imageUrl || ''; // REMOVED

                        if (slide.imageUrl) {
                            heroImagePreview.src = slide.imageUrl;
                            heroImagePreview.style.display = 'block';
                        } else {
                            heroImagePreview.src = '#';
                            heroImagePreview.style.display = 'none';
                        }
                        heroImageUploadInput.value = null; // Clear file input

                        heroSaveButton.textContent = 'Update Slide';
                        heroCancelEditButton.style.display = 'inline-block';
                        heroForm.scrollIntoView({ behavior: 'smooth' });
                        showMessage(heroFormError, ""); // Clear error if any
                        showMessage(heroFormSuccess, ""); // Clear success if any
                    } else {
                        showMessage(heroFormError, "Slide not found.");
                    }
                } catch (error) {
                    console.error("Error fetching slide for edit:", error);
                    showMessage(heroFormError, "Error fetching slide: " + error.message);
                }
            } else if (target.classList.contains('btn-delete')) {
                if (!slideId) return;
                if (confirm('Are you sure you want to delete this slide?')) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/hero_slides/${slideId}`, { method: 'DELETE' });
                        if (!response.ok) {
                             const errorBody = await response.text();
                             throw new Error(`Failed to delete slide: ${response.status} - ${errorBody}`);
                        }
                        // No JSON to parse for 204 response typically
                        showMessage(heroFormSuccess, "Slide deleted successfully!", true);
                        loadHeroSlides();
                    } catch (error) {
                        console.error("Error deleting hero slide:", error);
                        showMessage(heroFormError, "Error deleting slide: " + error.message);
                    }
                }
            }
        });
    }

    // Handle Cancel Edit Button
    if (heroCancelEditButton) {
        heroCancelEditButton.addEventListener('click', () => {
            resetHeroForm();
            showMessage(heroFormError, ""); 
            showMessage(heroFormSuccess, "");
        });
    }
    
    // Preview image before upload - REMOVED
    // if (heroImageUploadInput && heroCurrentImagePreview) { ... }


    // Removed Firebase auth.onAuthStateChanged listener. MSAL handles auth state and initializeDashboardContent is called after MSAL checks.

    // Programs Page Hero Management
    const programsHeroDocId = 'main_content'; // Document ID for programs page hero content
    // Ensure this ID is unique and used as the partition key if the container is partitioned by /id.

    const programsHeroForm = document.getElementById('programs-hero-form');
    const programsHeroTitleInput = document.getElementById('programs-hero-title');
    const programsHeroParagraphInput = document.getElementById('programs-hero-paragraph');
    const programsHeroStatusDiv = document.getElementById('programs-hero-status');
    const saveProgramsHeroButton = document.getElementById('save-programs-hero-button');

    // Load Programs Page Hero Content
    async function loadProgramsHeroContent() {
        if (!programsHeroTitleInput || !programsHeroParagraphInput) return;

        try {
            const response = await fetch(`${API_BASE_URL}/programs_page`);
            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
            }
            const item = await response.json();

            if (item && item.id === programsHeroDocId) { // API might return default if not found, check ID
                programsHeroTitleInput.value = item.heroTitle || '';
                programsHeroParagraphInput.value = item.heroParagraph || '';
                showMessage(programsHeroStatusDiv, "Content loaded.", true);
            } else {
                 // This case handles if API returns a default structure without matching ID, or empty
                showMessage(programsHeroStatusDiv, "No existing content found or content is default. Add/update content.", false);
                programsHeroTitleInput.value = item.heroTitle || ''; // Show default if provided
                programsHeroParagraphInput.value = item.heroParagraph || '';
            }
        } catch (error) {
            console.error("Error loading programs page hero content:", error);
            showMessage(programsHeroStatusDiv, "Error loading content: " + error.message, false);
            programsHeroTitleInput.value = 'Error';
            programsHeroParagraphInput.value = 'Could not load data.';
        }
    }

    // Handle Programs Page Hero Form Submission
    if (programsHeroForm) {
        programsHeroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Auth check is page-level via MSAL

            const title = programsHeroTitleInput.value.trim();
            const paragraph = programsHeroParagraphInput.value.trim();

            if (!title || !paragraph) {
                showMessage(programsHeroStatusDiv, "Please fill in both title and paragraph.", false);
                return;
            }
            
            if(saveProgramsHeroButton) saveProgramsHeroButton.disabled = true;

            const data = {
                id: programsHeroDocId, // Ensure the ID is part of the item
                heroTitle: title,
                heroParagraph: paragraph,
                lastUpdated: new Date().toISOString()
            };

            try {
                const response = await fetch(`${API_BASE_URL}/programs_page`, {
                    method: 'POST', // API uses POST for upsert on this specific singleton resource
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Failed to save programs page content: ${response.status} - ${errorBody}`);
                }
                const savedData = await response.json();
                showMessage(programsHeroStatusDiv, "Programs hero content saved successfully!", true);
            } catch (error) {
                console.error("Error saving programs hero content:", error);
                showMessage(programsHeroStatusDiv, "Error saving content: " + error.message, false);
            } finally {
                if(saveProgramsHeroButton) saveProgramsHeroButton.disabled = false;
            }
        });
    }

    // Program Cards Management
    // programsContainer is already defined

    const programCardForm = document.getElementById('program-card-form');
    const programCardFormTitle = document.getElementById('program-card-form-title');
    const programCardIdInput = document.getElementById('program-cardId');
    const programTitleInput = document.getElementById('program-title');
    const programDescriptionInput = document.getElementById('program-description');
    const programDurationInput = document.getElementById('program-duration');
    const programLinkUrlInput = document.getElementById('program-link-url');
    const programOrderInput = document.getElementById('program-order');
    const programImageUploadInput = document.getElementById('program-image-upload');
    const programImagePreview = document.getElementById('program-image-preview');
    const programCardSaveButton = document.getElementById('program-card-save-button');
    const programCardCancelEditButton = document.getElementById('program-card-cancel-edit-button');
    const programCardsList = document.getElementById('program-cards-list');
    const programCardFormError = document.getElementById('program-card-form-error');
    const programCardFormSuccess = document.getElementById('program-card-form-success');
    const programCardFormStatus = document.createElement('p'); // For image upload status
    programCardFormStatus.style.display = 'none';
    programCardForm.appendChild(programCardFormStatus);


    // Reset Program Card Form
    function resetProgramCardForm() {
        if (programCardForm) programCardForm.reset();
        if (programCardIdInput) programCardIdInput.value = '';
        if (programCardFormTitle) programCardFormTitle.textContent = 'Add New Program Card';
        if (programCardSaveButton) programCardSaveButton.textContent = 'Save Program Card';
        if (programCardCancelEditButton) programCardCancelEditButton.style.display = 'none';
        if (programImageUploadInput) programImageUploadInput.value = null;
        if (programImagePreview) {
            programImagePreview.src = '#';
            programImagePreview.style.display = 'none';
        }
        showMessage(programCardFormError, '', false);
        showMessage(programCardFormSuccess, '', true);
    }

    // Load Program Cards
    async function loadProgramCards() {
        if (!programCardsList) return;
        programCardsList.innerHTML = '<li class="list-item-placeholder">Loading program cards...</li>';

        try {
            const response = await fetch(`${API_BASE_URL}/programs`);
             if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`HTTP error! status: ${response.status} - ${errorBody}`);
            }
            const items = await response.json();

            if (!items || items.length === 0) {
                programCardsList.innerHTML = '<li class="list-item-placeholder">No program cards found. Add one using the form.</li>';
                return;
            }

            programCardsList.innerHTML = ''; // Clear list
            items.forEach(card => {
                const listItem = document.createElement('li');
                listItem.setAttribute('data-id', card.id);
                listItem.innerHTML = `
                    <div class="card-info">
                        <h4>${card.title} (Order: ${card.order})</h4>
                        <p>${card.description.substring(0, 60)}...</p>
                        ${card.imageUrl ? `<img src="${card.imageUrl}" alt="${card.title}" style="width: 100px; height: auto; margin-top: 5px;">` : ''}
                    </div>
                    <div class="card-actions">
                        <button class="btn btn-sm btn-edit program-card-edit">Edit</button>
                        <button class="btn btn-sm btn-danger program-card-delete">Delete</button>
                    </div>
                `;
                programCardsList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error loading program cards:", error);
            programCardsList.innerHTML = '<li class="list-item-placeholder error-message">Error loading program cards.</li>';
            showMessage(programCardFormError, "Error loading cards: " + error.message);
        }
    }
    
    // Preview image for Program Card - REMOVED
    // if (programImageUploadInput && programImagePreview) { ... }


    // Handle Program Card Form Submission
    if (programCardForm) {
        programCardForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Auth check is page-level via MSAL

            const cardId = programCardIdInput.value;
            const title = programTitleInput.value.trim();
            const description = programDescriptionInput.value.trim();
            const duration = programDurationInput.value.trim();
            const linkUrl = programLinkUrlInput.value.trim();
            const order = parseInt(programOrderInput.value, 10);
            // const imageUrlFromInput = programImageUrlInput.value.trim(); // REMOVED

            if (!title || !description || !duration || !linkUrl || isNaN(order)) {
                showMessage(programCardFormError, "Please fill in all required fields and ensure order is a number.");
                return;
            }

            if(programCardSaveButton) programCardSaveButton.disabled = true;
            if(programCardSaveButton) programCardSaveButton.textContent = cardId ? "Updating..." : "Saving...";
            showMessage(programCardFormSuccess, ""); // Clear previous success
            showMessage(programCardFormError, "");
            showMessage(programCardFormSuccess, "");

            let imageUrl = null;
            const imageFile = programImageUploadInput.files[0];
            let existingImageUrl = null;
            if (cardId && !imageFile) {
                 try {
                    // Assuming a GET by ID endpoint for programs, or fetch all and filter
                    const response = await fetch(`${API_BASE_URL}/programs`); // Or /programs/${cardId} if exists
                    if (response.ok) {
                        const programs = await response.json();
                        const currentCard = programs.find(p => p.id === cardId);
                        existingImageUrl = currentCard?.imageUrl;
                    } else {
                         if (programImagePreview.src && !programImagePreview.src.startsWith('data:') && programImagePreview.src !== '#') {
                            existingImageUrl = programImagePreview.src;
                        }
                    }
                 } catch(e) { console.warn("Could not fetch existing program image URL for edit.", e); }
            }


            if (imageFile) {
                const formData = new FormData();
                formData.append('image', imageFile);
                try {
                    showMessage(programCardFormStatus, "Uploading image via API...", true);
                    const uploadResponse = await fetch(`${API_BASE_URL}/upload_image`, {
                        method: 'POST',
                        body: formData
                    });
                    if (!uploadResponse.ok) {
                        const errorBody = await uploadResponse.text();
                        throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorBody}`);
                    }
                    const uploadResult = await uploadResponse.json();
                    imageUrl = uploadResult.imageUrl;
                    showMessage(programCardFormStatus, "Image uploaded successfully via API.", true);
                } catch (uploadError) {
                    showMessage(programCardFormError, "Image upload failed: " + uploadError.message, false);
                    if(programCardSaveButton) {
                        programCardSaveButton.disabled = false;
                        programCardSaveButton.textContent = cardId ? "Update Program Card" : "Save Program Card";
                    }
                    return;
                }
            } else if (cardId && existingImageUrl) {
                imageUrl = existingImageUrl;
            }

            const cardData = {
                title,
                description,
                duration,
                linkUrl,
                order,
                imageUrl: imageUrl,
                updatedAt: new Date().toISOString()
            };

            try {
                let response;
                if (cardId) {
                    cardData.id = cardId;
                    response = await fetch(`${API_BASE_URL}/programs/${cardId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cardData)
                    });
                } else {
                    cardData.id = generateUUID();
                    cardData.createdAt = new Date().toISOString();
                    response = await fetch(`${API_BASE_URL}/programs`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(cardData)
                    });
                }

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Failed to save program card: ${response.status} - ${errorBody}`);
                }
                const savedItem = await response.json();
                showMessage(programCardFormSuccess, `Program card ${cardId ? 'updated' : 'added'} successfully!`, true);
                resetProgramCardForm();
                loadProgramCards();

            } catch (error) {
                console.error("Error saving program card:", error);
                showMessage(programCardFormError, "Error saving card: " + error.message);
            } finally {
                if(programCardSaveButton) programCardSaveButton.disabled = false;
                if(programCardSaveButton) programCardSaveButton.textContent = cardId ? "Update Program Card" : "Save Program Card";
                 if (cardId) { // If it was an edit, reset form to "Add New" mode
                    resetProgramCardForm();
                }
            }
        });
    }

    // Handle Edit/Delete clicks on Program Cards List
    if (programCardsList) {
        programCardsList.addEventListener('click', async (e) => {
            const target = e.target;
            const listItem = target.closest('li');
            if (!listItem) return;
            const cardId = listItem.getAttribute('data-id');

            // Edit button
            if (target.classList.contains('program-card-edit')) {
                if (!cardId) return;
                try {
                    const response = await fetch(`${API_BASE_URL}/programs`); // Or /programs/${cardId} if exists
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const programs = await response.json();
                    const card = programs.find(p => p.id === cardId);

                    if (card) {
                        if(programCardFormTitle) programCardFormTitle.textContent = 'Edit Program Card';
                        if(programCardIdInput) programCardIdInput.value = card.id;
                        if(programTitleInput) programTitleInput.value = card.title || '';
                        if(programDescriptionInput) programDescriptionInput.value = card.description || '';
                        if(programDurationInput) programDurationInput.value = card.duration || '';
                        if(programLinkUrlInput) programLinkUrlInput.value = card.linkUrl || '';
                        if(programOrderInput) programOrderInput.value = card.order || 1;
                        // if(programImageUrlInput) programImageUrlInput.value = card.imageUrl || ''; // REMOVED

                        if (card.imageUrl) {
                            if(programImagePreview) {
                                programImagePreview.src = card.imageUrl;
                                programImagePreview.style.display = 'block';
                            }
                        } else {
                           if(programImagePreview) {
                                programImagePreview.src = '#';
                                programImagePreview.style.display = 'none';
                           }
                        }
                        if(programImageUploadInput) programImageUploadInput.value = null; // Clear file input

                        if(programCardSaveButton) programCardSaveButton.textContent = 'Update Program Card';
                        if(programCardCancelEditButton) programCardCancelEditButton.style.display = 'inline-block';
                        if(programCardForm) programCardForm.scrollIntoView({ behavior: 'smooth' });
                        showMessage(programCardFormError, ""); 
                        showMessage(programCardFormSuccess, "");
                    } else {
                         showMessage(programCardFormError, "Program card not found.");
                    }
                } catch (error) {
                    console.error("Error fetching program card for edit:", error);
                    showMessage(programCardFormError, "Error fetching card: " + error.message);
                }
            } 
            // Delete button
            else if (target.classList.contains('program-card-delete')) {
                if (!cardId) return;
                if (confirm('Are you sure you want to delete this program card?')) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/programs/${cardId}`, { method: 'DELETE' });
                        if (!response.ok) {
                            const errorBody = await response.text();
                            throw new Error(`Failed to delete program card: ${response.status} - ${errorBody}`);
                        }
                        showMessage(programCardFormSuccess, "Program card deleted successfully!", true);
                        loadProgramCards();
                    } catch (error) {
                        console.error("Error deleting program card:", error);
                        showMessage(programCardFormError, "Error deleting card: " + error.message);
                    }
                }
            }
        });
    }
    
    // Handle Program Card Cancel Edit Button
    if (programCardCancelEditButton) {
        programCardCancelEditButton.addEventListener('click', () => {
            resetProgramCardForm();
        });
    }

     // Removed Firebase auth.onAuthStateChanged listener for program cards load.
     // loadProgramCards() is called within initializeDashboardContent() after MSAL auth.

});
