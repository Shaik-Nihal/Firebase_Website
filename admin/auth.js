document.addEventListener('DOMContentLoaded', () => {
    const loginError = document.getElementById('login-error');

    // MSAL Configuration
    const MSAL_CONFIG = {
        auth: {
            clientId: "YOUR_B2C_APPLICATION_CLIENT_ID", // Replace with actual Client ID from Azure portal
            authority: "https://YOUR_B2C_TENANT_NAME.b2clogin.com/YOUR_B2C_TENANT_NAME.onmicrosoft.com/YOUR_SIGN_UP_SIGN_IN_POLICY_NAME", // Replace with your tenant name and policy name
            knownAuthorities: ["YOUR_B2C_TENANT_NAME.b2clogin.com"], // Replace with your tenant name
            redirectUri: window.location.origin + "/admin/index.html", // Or dashboard.html if it handles response
            postLogoutRedirectUri: window.location.origin + "/admin/index.html"
        },
        cache: {
            cacheLocation: "sessionStorage", // This means session is cleared when browser/tab is closed. Use "localStorage" for persistence.
            storeAuthStateInCookie: false, // Set to true if you have issues with IE11 or Safari
        }
    };

    const LOGIN_REQUEST = {
        scopes: ["openid", "profile"]
        // Example for API scopes:
        // scopes: ["openid", "profile", "https://YOUR_B2C_TENANT_NAME.onmicrosoft.com/YOUR_API_APP_ID_URI/access_as_user"]
    };

    // Initialize MSAL PublicClientApplication
    const msalInstance = new msal.PublicClientApplication(MSAL_CONFIG);

    // Function to display error messages
    function displayError(message) {
        if (loginError) {
            loginError.textContent = message;
            loginError.style.display = 'block';
        } else {
            alert(message);
        }
    }

    // Function to handle login
    function login() {
        msalInstance.loginRedirect(LOGIN_REQUEST).catch(error => {
            console.error("Login redirect error:", error);
            displayError("Login failed. See console for details.");
        });
    }

    // Handle redirect promise from AAD B2C
    function handleResponse(response) {
        if (response !== null) {
            console.log("MSAL Response:", response);
            msalInstance.setActiveAccount(response.account);
            sessionStorage.setItem('msalAccount', response.account.homeAccountId); // Or use other ways to mark as logged in
            console.log("User logged in. Account:", response.account);
            // Check if on index.html, redirect to dashboard
            if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin')) {
                window.location.href = 'dashboard.html';
            }
        } else {
            // Check if user is already signed in (e.g., page refresh)
            const currentAccounts = msalInstance.getAllAccounts();
            if (currentAccounts && currentAccounts.length > 0) {
                msalInstance.setActiveAccount(currentAccounts[0]);
                console.log("User already signed in. Account:", currentAccounts[0]);
                if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin')) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                console.log("No user signed in.");
                // If on a protected page other than index.html, redirect to login
                // This logic is more critical for dashboard.js, but good to be aware of
            }
        }
    }

    // Attach login function to the login button
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', login);
    }

    // Handle redirect flow
    msalInstance.handleRedirectPromise()
        .then(handleResponse)
        .catch(err => {
            console.error("Redirect promise error:", err);
            displayError("Error during authentication redirect. " + err.toString());
            // If the error is about interaction_in_progress, it might mean multiple redirects are happening.
            // Or if redirectUri is not registered correctly.
            if (err.errorCode === "interaction_in_progress") {
                 console.warn("Interaction is already in progress. This may be a duplicate redirect handler call.");
            }
        });
});
