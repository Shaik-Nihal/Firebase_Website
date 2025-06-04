(function() {
    // Ensure Firebase is expected to be initialized by firebase-config.js
    // This script should be included AFTER firebase-app, firebase-auth, firebase-firestore, and firebase-config.js

    // Debounce to prevent multiple executions if Firebase takes time to initialize
    if (window.maintenanceCheckInitialized) {
        return;
    }
    window.maintenanceCheckInitialized = true;

    // Function to inject a visual cue for admins when site is in maintenance mode
    function showAdminMaintenanceBanner() {
        const banner = document.createElement('div');
        banner.id = 'admin-maintenance-banner';
        banner.textContent = 'ATTENTION: The site is currently in MAINTENANCE MODE. Public users are being redirected.';
        banner.style.backgroundColor = 'orange';
        banner.style.color = 'black';
        banner.style.textAlign = 'center';
        banner.style.padding = '10px';
        banner.style.fontWeight = 'bold';
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.zIndex = '9999'; // Ensure it's on top
        document.body.prepend(banner); // Add to the top of the body
    }


    // Delay check slightly to ensure firebase-config has loaded and initialized Firebase app
    setTimeout(() => {
        if (typeof firebase === 'undefined' ||
            typeof firebase.auth === 'undefined' ||
            typeof firebase.firestore === 'undefined' ||
            !firebase.apps.length) { // Check if Firebase app is initialized
            console.error("Firebase SDKs or config not fully loaded or initialized. Maintenance check cannot run reliably.");
            // Fallback: allow site to load to prevent locking everyone out if Firebase fails to load.
            return;
        }

        const auth = firebase.auth();
        const db = firebase.firestore();
        const siteStatusCollectionName = 'site_status';
        const siteStatusDocId = 'current_settings';
        // Determine the correct base path for maintenance.html
        // If pages are at root (e.g. index.html), path is 'frontend/maintenance.html'
        // If pages are in /frontend/ (e.g. about-us.html), path is 'maintenance.html'
        // If pages are in /frontend/programs/ (e.g. program.html), path is '../maintenance.html'
        // Simplest is to use an absolute path from the root.
        const maintenancePageUrl = '/frontend/maintenance.html';


        // Function to perform the check
        function performMaintenanceCheck() {
            // Avoid running if already on the maintenance page
            if (window.location.pathname === maintenancePageUrl || window.location.pathname === '/frontend/maintenance') {
                 console.log("Already on the maintenance page or attempting to redirect to it, aborting further checks here.");
                return;
            }

            db.collection(siteStatusCollectionName).doc(siteStatusDocId).get().then((doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    if (data.isActive) {
                        // Maintenance mode is active, now check for admin user
                        const user = auth.currentUser; // Get current user synchronously

                        if (user) {
                            // User is logged in. For this CMS, logged-in users are considered admins.
                            console.log("Maintenance mode is active, but user is authenticated (assumed admin). Access granted.");
                            // Optional: display a small banner for admins "Site is in Maintenance Mode"
                            showAdminMaintenanceBanner();
                        } else {
                            // No user logged in, or auth state not yet determined to be logged in.
                            // Redirect to maintenance page if not already on it.
                            console.log("Maintenance mode active and user not authenticated. Redirecting to maintenance page.");
                            window.location.href = maintenancePageUrl;
                        }
                    } else {
                        // Maintenance mode is not active
                        console.log("Maintenance mode is not active. Site loading normally.");
                    }
                } else {
                    // Settings document doesn't exist, assume site is not in maintenance
                    console.log("Maintenance settings document not found. Site loading normally.");
                }
            }).catch((error) => {
                console.error("Error fetching maintenance status:", error);
                // Fallback: allow site to load to prevent locking everyone out on error
            });
        }

        // onAuthStateChanged is the most reliable way to wait for user status
        auth.onAuthStateChanged(function(user) {
            if (window.maintenanceCheckPerformedAuth) return; // Ensure it runs once per page load after auth state is known
            window.maintenanceCheckPerformedAuth = true;

            performMaintenanceCheck();

        }, function(error) {
            console.error("Auth error during maintenance check:", error);
            if (window.maintenanceCheckPerformedAuthError) return;
            window.maintenanceCheckPerformedAuthError = true;
            // Fallback: allow site to load, but still perform the check.
            // This will likely take the "not logged in" path if auth itself failed.
            performMaintenanceCheck();
        });

        // Fallback if onAuthStateChanged doesn't fire quickly (e.g. user already cached)
        // We need to ensure performMaintenanceCheck is called at least once.
        // The onAuthStateChanged listener above will typically handle this.
        // However, if for some reason it's delayed or auth is already known,
        // we might want an immediate check.
        // Let's rely on onAuthStateChanged primarily as it's the correct pattern.
        // If no user is signed in, currentUser is null. If one is, it's the user object.
        // The logic in performMaintenanceCheck handles `auth.currentUser` correctly.
        // The initial check could be:
        // if (!auth.currentUser && !window.maintenanceCheckPerformedAuth) {
        //    performMaintenanceCheck(); // Check immediately if no user seems to be loading
        // }
        // This might be redundant with onAuthStateChanged. The key is that onAuthStateChanged
        // IS called on load, even if the user state is already known (e.g. cached).

    }, 100); // Small delay of 100ms

})();
