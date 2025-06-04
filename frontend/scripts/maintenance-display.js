document.addEventListener('DOMContentLoaded', () => {
    if (typeof firebase === 'undefined' || typeof firebase.firestore === 'undefined') {
        console.error("Firebase not initialized for maintenance page.");
        const messageDiv = document.getElementById('maintenance-message-content');
        if (messageDiv) messageDiv.textContent = "Could not load maintenance details. Please check back soon.";
        return;
    }

    const db = firebase.firestore();
    const siteStatusCollectionName = 'site_status';
    const siteStatusDocId = 'current_settings'; // Must match admin panel

    const messageDiv = document.getElementById('maintenance-message-content');

    db.collection(siteStatusCollectionName).doc(siteStatusDocId).get()
        .then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.isActive && data.message) {
                    messageDiv.textContent = data.message;
                } else {
                    // If somehow redirected here but mode is not active or no message
                    messageDiv.textContent = "The site is currently undergoing scheduled maintenance. Please check back shortly.";
                }
            } else {
                // Document doesn't exist
                messageDiv.textContent = "Maintenance status is currently not available. Please check back soon.";
            }
        })
        .catch((error) => {
            console.error("Error fetching maintenance message:", error);
            messageDiv.textContent = "Error loading maintenance information. Please try again later.";
        });
});
