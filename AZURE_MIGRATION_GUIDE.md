# Azure Migration Guide for Firebase to Azure

This guide provides step-by-step instructions for migrating key services from Firebase to Azure equivalents.

## 1. Setting up Azure AD B2C for Admin Authentication

Azure Active Directory B2C (Azure AD B2C) will replace Firebase Authentication for the admin panel.

### Steps:

1.  **Create an Azure AD B2C Tenant:**
    *   Log in to the Azure portal.
    *   Search for "Azure AD B2C" in the search bar and select it.
    *   Click on "Create a new Azure AD B2C Tenant" or "Link an existing tenant".
    *   Choose "Create a new Azure AD B2C Tenant".
    *   Enter an **Organization name** (e.g., `YourAppNameB2C`).
    *   Enter an **Initial domain name** (e.g., `yourcompanyname.onmicrosoft.com`). This needs to be globally unique.
    *   Select your **Subscription** and a **Resource group** (create a new one if needed, e.g., `YourAppName-Auth-RG`).
    *   Choose the **Country/Region**.
    *   Click "Review + create", then "Create".
    *   **Important:** Once created, you need to switch to the B2C directory. Click your user icon in the top right, then "Switch directory", and select the newly created B2C tenant.

2.  **Register an Application for the Admin Panel:**
    *   In your B2C tenant, search for "Azure AD B2C" and select it.
    *   Under "Manage", click on "App registrations".
    *   Click "+ New registration".
    *   Enter a **Name** (e.g., `AdminPanelApp`).
    *   Under "Supported account types", select "Accounts in any identity provider or organizational directory (for authenticating users with user flows)".
    *   Under "Redirect URI (optional)", select "Single-page application (SPA)" and enter a placeholder URI like `http://localhost:3000/auth-callback`. You will update this later with your actual admin panel's URL.
    *   Under "Permissions", check "Grant admin consent to openid and offline_access permissions".
    *   Click "Register".

3.  **Create User Flows (Sign-up/Sign-in):**
    *   In your B2C tenant, under "Policies", click on "User flows".
    *   Click "+ New user flow".
    *   Select the "Sign up and sign in" user flow type.
    *   Choose "Recommended" and click "Create".
    *   Enter a **Name** for the policy (e.g., `B2C_1_signup_signin`). **Note this name down.**
    *   Under "Identity providers", select "Email signup". You can configure other identity providers later if needed.
    *   Under "Multifactor authentication", configure as needed (initially, you might set it to "Off" for simplicity).
    *   Under "User attributes and token claims", choose the attributes you want to collect during sign-up and the claims to be included in the token. Click "Show more..." to see all options (e.g., select "Display Name", "Email Address").
    *   Click "Create".

4.  **Configure Redirect URIs:**
    *   Go back to "App registrations" in your B2C tenant.
    *   Select your `AdminPanelApp`.
    *   Click on "Authentication".
    *   Under "Single-page application", add the actual URL(s) where your admin panel will be hosted and will handle the authentication callback. For example:
        *   `https://your-admin-panel-domain.com/auth-callback`
        *   If using Azure Static Web Apps, this might be your production URL.
    *   Ensure "Implicit grant and hybrid flows" options for "Access tokens" and "ID tokens" are **unchecked** if you are using the Authorization Code Flow with PKCE (recommended for SPAs). If your library requires them, check as necessary.
    *   Click "Save".

5.  **Note Down Key Configuration Values:**
    *   **B2C Tenant Name/Domain:** Go to the overview page of your Azure AD B2C service. It's the "Domain name" (e.g., `yourcompanyname.onmicrosoft.com`).
    *   **Application (client) ID:** In "App registrations", select your `AdminPanelApp`. The "Application (client) ID" is displayed on its overview page.
    *   **User Flow/Policy Names:** The names you created, e.g., `B2C_1_signup_signin`.
    *   **Issuer URL (for token validation):** This is typically `https://<your-tenant-name>.b2clogin.com/<your-tenant-name>.onmicrosoft.com/<policy-name>/v2.0/.well-known/openid-configuration`. You can find this by running your user flow and inspecting the network requests or from the user flow's "Run user flow" page.

## 2. Setting up Azure Cosmos DB (NoSQL API)

Azure Cosmos DB with the NoSQL API will replace Firestore for storing JSON documents.

### Steps:

1.  **Create an Azure Cosmos DB Account:**
    *   In the Azure portal, search for "Azure Cosmos DB" and select it.
    *   Click "+ Create".
    *   Under "Azure Cosmos DB for NoSQL", click "Create".
    *   Select your **Subscription** and **Resource group** (create a new one or use an existing one, e.g., `YourAppName-Data-RG`).
    *   Enter an **Account Name** (e.g., `your-app-name-db`). This needs to be globally unique.
    *   Choose a **Location** (ideally close to your users or application services).
    *   For **Capacity mode**, choose "Provisioned throughput" for predictable workloads or "Serverless" for variable/unpredictable workloads (often good for starting out).
    *   You can leave other settings as default for now (e.g., "Apply Free Tier Discount" if eligible and desired).
    *   Click "Review + create", then "Create". Deployment might take a few minutes.

2.  **Choose the NoSQL API:**
    *   This was selected in the previous step. The "Azure Cosmos DB for NoSQL" is the correct choice for a document database similar to Firestore.

3.  **Create a Database:**
    *   Once your Cosmos DB account is provisioned, go to the resource.
    *   In the left navigation pane, click on "Data Explorer".
    *   Click on "New Container" and select "New Database".
    *   Enter a **Database id** (e.g., `CMSDatabase`).
    *   Choose throughput options (manual or autoscale, or "Serverless" if your account is serverless).
    *   Click "OK".

4.  **Create Containers:**
    *   With the newly created database selected in Data Explorer:
    *   Click "New Container" again.
        *   **Database id:** Select `CMSDatabase`.
        *   **Container id:** `hero_section`
        *   **Partition key:** `/id` (Assuming each document in `hero_section` will have a unique `id` field. If there's only ever one document, you could use a fixed value like `/singleton`).
        *   Click "OK".
    *   Repeat the "New Container" process for the other containers:
        *   **Container id:** `programs_page`
        *   **Partition key:** `/id` (Similar reasoning as `hero_section`).
        *   **Container id:** `programs`
        *   **Partition key:** `/id` (If program documents have unique IDs. If programs are often queried by a category, `/category` might be a better choice. For simplicity, `/id` is a common starting point).

5.  **Briefly Explain Partition Keys:**
    *   A **partition key** is a property in your JSON documents that Azure Cosmos DB uses to distribute data across multiple logical and physical partitions for scalability.
    *   Choosing the right partition key is crucial for performance and cost.
    *   It should be a property that has a high cardinality (many unique values) and is frequently used in your queries' filters.
    *   For single-document collections or collections where items are usually retrieved by their unique ID, `/id` is a common and simple choice.
    *   If you often query for programs by `category`, then `/category` could be a good partition key for the `programs` container. This would make queries filtered by category more efficient.

6.  **Note Down Connection String/Endpoint and Primary Key:**
    *   In your Cosmos DB account's left navigation pane, under "Settings", click on "Keys".
    *   You will find:
        *   **URI** (This is your endpoint, e.g., `https://your-app-name-db.documents.azure.com:443/`)
        *   **PRIMARY KEY**
        *   **PRIMARY CONNECTION STRING**
    *   Copy these values. The connection string is often the easiest to use with SDKs.

## 3. Setting up Azure Blob Storage

Azure Blob Storage will replace Firebase Storage for storing images and other static files.

### Steps:

1.  **Create an Azure Storage Account:**
    *   In the Azure portal, search for "Storage accounts" and select it.
    *   Click "+ Create".
    *   Select your **Subscription** and **Resource group** (e.g., `YourAppName-Data-RG`).
    *   Enter a **Storage account name** (e.g., `yourappnamestorage`). This needs to be globally unique and use lowercase letters and numbers.
    *   Choose a **Region**.
    *   For **Performance**, "Standard" is usually sufficient for images.
    *   For **Redundancy**, "Locally-redundant storage (LRS)" is the most cost-effective, but choose based on your data durability requirements.
    *   Click "Review", then "Create".

2.  **Create a Blob Container:**
    *   Once the storage account is deployed, go to the resource.
    *   In the left navigation pane, under "Data storage", click on "Containers".
    *   Click "+ Container".
    *   Enter a **Name** for your container (e.g., `cms-images`). Container names must be lowercase.
    *   For **Public access level**, choose:
        *   **Private (no anonymous access):** Default and most secure. Requires Shared Access Signatures (SAS) tokens or access keys for all access.
        *   **Blob (anonymous read access for blobs only):** Allows public read access to individual blobs if the direct URL is known. This is similar to how Firebase Storage often works for public images.
        *   **Container (anonymous read access for containers and blobs):** Allows listing all blobs in the container as well. Generally not recommended unless you specifically need that.
        *   **Initial Recommendation:** Choose **"Blob (anonymous read access for blobs only)"** for simpler direct URL access to uploaded images, similar to how external URLs are currently handled.
    *   Click "Create".

3.  **Setting Public Access Level:**
    *   This was set during container creation. If you need to change it later:
        *   Go to your storage account.
        *   Click on "Containers".
        *   Click on the `cms-images` container.
        *   Click "Change access level".
        *   Select the desired level and click "OK".

4.  **Note Down Connection String and Container Name:**
    *   **Container Name:** `cms-images` (or whatever you named it).
    *   **Connection String:**
        *   In your storage account's left navigation pane, under "Security + networking", click on "Access keys".
        *   You will see "key1" and "key2". Each has a **Connection string**. Copy one of these.
        *   These keys provide full access to your storage account. Handle them securely.

## 4. Setting up Azure Static Web Apps for Hosting

Azure Static Web Apps will replace Firebase Hosting for your front-end application and will also host the Azure Functions API created in the `api/` directory. The project structure (static files in the root, API in `/api`) is well-suited for Azure Static Web Apps.

### Steps:

1.  **Create an Azure Static Web App Resource:**
    *   In the Azure portal, search for "Static Web Apps" and select it.
    *   Click "+ Create".
    *   Select your **Subscription** and **Resource group** (create a new one, e.g., `YourAppName-Hosting-RG`).
    *   Enter a **Name** for your static web app (e.g., `your-app-name-cms`). This will be part of the default URL.
    *   Choose a **Pricing plan** (the "Free" tier is available and suitable for many applications. Standard plans are available for more features).
    *   Choose a **Region** for Azure Functions and staging environments.
    *   Under "Deployment details", select your source:
        *   Choose **GitHub** (or other like Azure DevOps, Bitbucket, GitLab).

2.  **Connect to a GitHub Repository (or other source control):**
    *   If you selected GitHub:
        *   Click "Sign in with GitHub" and authorize Azure to access your repositories.
        *   Select your **Organization**.
        *   Select your **Repository** (the one containing this project).
        *   Select your **Branch** (e.g., `main` or `master`).

3.  **Configure Build Settings:**
    *   Azure Static Web Apps will try to detect your framework. Given this project's structure (vanilla HTML/CSS/JS with a backend API in `/api`):
    *   **Build Presets:**
        *   If your frontend were a framework like Angular, React, or Vue that requires a build step, you would select the appropriate preset (e.g., `Angular`, `React`, `Vue`). The `Output location` would then point to the build output directory (like `dist`, `build`).
        *   For this project, since the frontend files (HTML, CSS, JS in the root and `frontend/` folders) are served as is without a separate build step, you can select **"Custom"** or no preset.
    *   **App location**: Set this to `/`. This tells Azure Static Web Apps that your application code (static files like `index.html`, `admin/index.html`, `frontend/programs.html`, etc.) is located at the root of your repository.
    *   **Api location**: Set this to `api`. This points to the directory containing your Azure Functions code. Azure Static Web Apps will automatically build and deploy these functions.
    *   **Output location**: This can be left blank or set to `/`. Since the static files are served from the root (`App location: /`) and there isn't a separate build output directory for them, this setting is straightforward.
    *   Click "Review + create", then "Create".

4.  **API and Environment Variables Configuration:**
    *   Azure Static Web Apps will automatically detect the Node.js Azure Functions in your `api` folder and deploy them.
    *   **Crucial Step:** Your Azure Functions in `api/shared/cosmosdb-client.js` and `api/upload_image-post/index.js` rely on environment variables for database connection strings, keys, and container names. These **must** be configured in your deployed Static Web App:
        *   Go to your created Static Web App resource in the Azure portal.
        *   In the left navigation pane, click on "Configuration".
        *   Under "Application settings", add the following key-value pairs. These names must exactly match what's used in your `process.env` calls in the Function code:
            *   `COSMOS_DB_ENDPOINT` = `Your_Actual_Cosmos_DB_Endpoint_URI`
            *   `COSMOS_DB_KEY` = `Your_Actual_Cosmos_DB_Primary_Key`
            *   `COSMOS_DB_DATABASE_ID` = `CMSDatabase` (or your chosen database ID)
            *   `HERO_CONTAINER_ID` = `hero_section`
            *   `PROGRAMS_CONTAINER_ID` = `programs`
            *   `PROGRAMS_PAGE_CONTAINER_ID` = `programs_page`
            *   `AZURE_STORAGE_CONNECTION_STRING` = `Your_Actual_Azure_Storage_Connection_String`
            *   `AZURE_STORAGE_CONTAINER_NAME` = `cms-images` (or your chosen blob container name)
            *   *(Add any other environment variables your functions might require)*
        *   Click "Save" after adding all necessary application settings. These settings are securely stored and injected into your Function App environment at runtime.

5.  **Deployment Process:**
    *   Once the Static Web App resource is created and linked to your repository branch, Azure Static Web Apps sets up a GitHub Action (or equivalent for other providers) for CI/CD.
    *   Any changes pushed to the configured branch will automatically trigger a new build and deployment of your static frontend and the Azure Functions API.
    *   You can monitor the deployment status in the "GitHub Actions" tab of your repository or in the Azure portal for your Static Web App.

6.  **Note Down the Default URL and Configure Custom Domain:**
    *   Once deployed, your Static Web App will be available at a default URL (e.g., `https://<random-name>-<random-name>.azurestaticapps.net`). Test your application thoroughly using this URL, including admin panel login and CMS functionalities.
    *   After successful testing, you will likely want to configure a custom domain (e.g., `www.yourdomain.com`).
        *   Go to the "Custom domains" section in your Static Web App resource in the Azure portal.
        *   Follow the instructions to add your custom domain, which will involve validating ownership by creating DNS records (e.g., CNAME or TXT records) with your domain registrar.

---

Remember to store all noted credentials (Tenant ID, Application IDs, Policy Names, Connection Strings, Keys, URLs) securely, for example, in a password manager or Azure Key Vault, and use them to configure your application's backend and frontend.
