# Application Testing Checklist (Post-Migration to Azure)

This checklist provides a comprehensive set of tests to perform after migrating the CMS and its frontend to Azure services (Azure AD B2C, Azure Cosmos DB, Azure Blob Storage, Azure Static Web Apps with Azure Functions).

## I. Admin Panel Testing (`/admin/index.html`, `/admin/dashboard.html`)

### A. Authentication (Azure AD B2C)
1.  [ ] **Successful Login:** Attempt to log in with valid Azure AD B2C administrator credentials.
    *   *Expected:* Successful authentication.
2.  [ ] **Redirection Post-Login:** After successful login, verify redirection to `dashboard.html`.
    *   *Expected:* User is on `admin/dashboard.html`.
3.  [ ] **Failed Login:** Attempt to log in with invalid/incorrect Azure AD B2C credentials.
    *   *Expected:* Login fails, and an appropriate error message is displayed on the login page.
4.  [ ] **Successful Logout:** Click the "Logout" button on `dashboard.html`.
    *   *Expected:* User is logged out and redirected to `admin/index.html` (or the configured post-logout redirect URI).
5.  [ ] **Direct Dashboard Access (Unauthorized):** Attempt to navigate directly to `admin/dashboard.html` in the browser without an active login session.
    *   *Expected:* User is redirected to the login page (`admin/index.html`).

### B. Hero Slides Management
1.  [ ] **Create New Hero Slide:**
    *   [ ] Navigate to the Hero Slides management section.
    *   [ ] Fill in all text fields (Heading, Paragraph, Button Text, Button URL, Order).
    *   [ ] Upload a new image using the file input.
    *   [ ] Click "Save Slide".
    *   *Expected:* A success message is displayed. The form resets. The new slide appears in the "Existing Hero Slides" list.
2.  [ ] **Verify New Slide in Cosmos DB:**
    *   [ ] Using Azure portal or appropriate tool, check the `hero_section` container in your Azure Cosmos DB.
    *   *Expected:* A new document exists with the data entered in step 1. The `imageUrl` field should point to an Azure Blob Storage URL. The `id`, `createdAt`, and `updatedAt` fields should be populated.
3.  [ ] **Verify Image in Blob Storage:**
    *   [ ] Navigate to your Azure Blob Storage container (e.g., `cms-images`).
    *   *Expected:* The image uploaded in step 1.b exists in the container (filename might be a UUID + original name). The image URL from Cosmos DB should correctly point to this blob.
4.  [ ] **Edit Existing Hero Slide (Replace Image):**
    *   [ ] Choose an existing slide from the list and click "Edit".
    *   [ ] Modify some or all text fields.
    *   [ ] Upload a *new* image, different from the current one.
    *   [ ] Click "Update Slide".
    *   *Expected:* A success message is displayed. The form resets. The slide in the list shows updated information.
5.  [ ] **Edit Existing Hero Slide (Preserve Image):**
    *   [ ] Choose another existing slide and click "Edit".
    *   [ ] Modify some text fields.
    *   [ ] Do *not* select a new image file.
    *   [ ] Click "Update Slide".
    *   *Expected:* A success message is displayed. The form resets. The slide shows updated text, and the original image is preserved.
6.  [ ] **Verify Updated Slide in Cosmos DB:**
    *   [ ] Check the corresponding document in the `hero_section` container in Cosmos DB.
    *   *Expected:* Text fields are updated. If a new image was uploaded (step 4.c), the `imageUrl` points to the new Azure Blob Storage URL. If the image was preserved (step 5.c), the `imageUrl` remains unchanged. `updatedAt` field is updated.
7.  [ ] **Delete Hero Slide:**
    *   [ ] Choose an existing slide and click "Delete". Confirm the action.
    *   *Expected:* A success message is displayed. The slide is removed from the "Existing Hero Slides" list. The corresponding document is removed from the `hero_section` container in Cosmos DB. (Note: The image file in Blob Storage might remain, as per current design – this is acceptable unless cleanup is implemented).
8.  [ ] **Check Display Order:**
    *   [ ] If multiple slides exist, verify they are listed in the admin panel according to their "Order" field.

### C. Programs Page Hero Management
1.  [ ] **Edit Programs Page Hero Content:**
    *   [ ] Navigate to the "Programs Page Hero" section.
    *   [ ] Modify the "Hero Title" and "Hero Paragraph" fields.
    *   [ ] Click "Save Programs Hero".
    *   *Expected:* A success message is displayed.
2.  [ ] **Verify Update in Cosmos DB:**
    *   [ ] Check the `programs_page` container in Cosmos DB for the document with `id: "main_content"`.
    *   *Expected:* The `heroTitle` and `heroParagraph` fields are updated with the new values. `lastUpdated` field is updated.

### D. Program Cards Management
1.  [ ] **Create New Program Card:**
    *   [ ] Navigate to the Program Cards management section.
    *   [ ] Fill in all fields (Title, Description, Duration, Link URL, Order).
    *   [ ] Upload an image for the card.
    *   [ ] Click "Save Program Card".
    *   *Expected:* Success message. Form resets. New card appears in the list.
2.  [ ] **Verify New Card in Cosmos DB & Blob Storage:**
    *   [ ] Check the `programs` container in Cosmos DB for the new card document.
    *   *Expected:* Data matches input. `imageUrl` points to an Azure Blob Storage URL. `id`, `createdAt`, `updatedAt` populated.
    *   [ ] Verify the uploaded image exists in Azure Blob Storage.
3.  [ ] **Edit Existing Program Card (Replace Image):**
    *   [ ] Edit an existing card. Change text fields. Upload a *new* image.
    *   [ ] Click "Update Program Card".
    *   *Expected:* Success message. Card updates in list.
4.  [ ] **Edit Existing Program Card (Preserve Image):**
    *   [ ] Edit an existing card. Change text fields. Do *not* upload a new image.
    *   [ ] Click "Update Program Card".
    *   *Expected:* Success message. Card updates with new text, original image URL preserved.
5.  [ ] **Verify Updated Card in Cosmos DB:**
    *   [ ] Check the corresponding document in the `programs` container.
    *   *Expected:* Fields and `imageUrl` (if changed) are updated. `updatedAt` is updated.
6.  [ ] **Delete Program Card:**
    *   [ ] Delete an existing program card. Confirm action.
    *   *Expected:* Success message. Card removed from list and Cosmos DB.
7.  [ ] **Check Display Order:**
    *   [ ] Verify cards are listed according to their "Order" field.

### E. General Admin UI/UX
1.  [ ] **Form Reset:** After saving or canceling an edit for any content type, verify the form fields reset to their default/empty state.
2.  [ ] **Image Previews (New):** When uploading a new image for a Hero Slide or Program Card, verify the selected image preview appears correctly before saving.
3.  [ ] **Image Previews (Edit):** When editing an item that already has an image, verify the current image is displayed in the preview area.
4.  [ ] **Feedback Messages:** Ensure clear and appropriate success or error messages are displayed for all create, update, delete, and image upload operations.
5.  [ ] **Console Errors:** Open the browser's developer console.
    *   *Expected:* No JavaScript errors (typically red messages) during any operations. Warnings (yellow) should be reviewed but may not be critical.

## II. Frontend Website Testing (Public-facing pages)

### A. Homepage (`index.html` or root)
1.  [ ] **Hero Slides Load:**
    *   *Expected:* Hero slides are displayed correctly with their headings, paragraphs, button text/links, and images. Images should be served from Azure Blob Storage (verify image URLs via browser inspector).
2.  [ ] **Program Cards Load:**
    *   *Expected:* Featured program cards are displayed correctly with their titles, descriptions, and images. Images should be served from Azure Blob Storage.
3.  [ ] **Links:**
    *   *Expected:* All buttons/links in hero slides and program cards navigate to the correct URLs.

### B. Programs Page (`frontend/programs.html`)
1.  [ ] **Programs Page Hero:**
    *   *Expected:* The hero title and paragraph for the programs page are displayed correctly based on content from the `programs_page` container.
2.  [ ] **Full Program Cards List:**
    *   *Expected:* All program cards from the `programs` container are displayed correctly with their content and images (served from Azure Blob Storage).

### C. Other CMS-driven Pages (if any)
1.  [ ] **Verify Content and Images:** If any other pages (e.g., About Us) were configured to be CMS-driven via Azure Functions:
    *   *Expected:* Content and images load correctly from their respective API endpoints/Cosmos DB containers.

### D. General Frontend UI/UX
1.  [ ] **Broken Images:** Navigate through all public-facing pages.
    *   *Expected:* No broken image icons. All CMS-managed images load correctly and are served from Azure Blob Storage.
2.  [ ] **Console Errors:** Open browser developer console while navigating the site.
    *   *Expected:* No JavaScript errors.
3.  [ ] **Content Freshness:** After making a change in the admin panel, check if the public frontend reflects the change.
    *   *Note:* This might require clearing browser cache or waiting for any API/CDN caching to expire if applicable. Test this by making a noticeable change.
4.  [ ] **Responsiveness:** View key pages (Homepage, Programs) on different screen sizes (desktop, common tablet resolutions, common mobile resolutions).
    *   *Expected:* Layout adjusts appropriately, content is readable, and functionality is maintained.

## III. API Functionality (Indirectly via UI & Browser Dev Tools)

### A. Monitor Network Tab
1.  [ ] While performing all admin panel operations (CRUD for hero slides, program cards, programs page hero; image uploads) and while loading frontend pages, keep the browser's Network tab open in developer tools.

### B. Verify API Calls Success
1.  [ ] **Admin Operations:**
    *   GET (e.g., `/api/hero_slides`): Should return 200 OK with data.
    *   POST (e.g., `/api/hero_slides` to create): Should return 201 Created with the new item.
    *   PUT (e.g., `/api/hero_slides/{id}` to update): Should return 200 OK with the updated item.
    *   DELETE (e.g., `/api/hero_slides/{id}`): Should return 204 No Content.
    *   POST (`/api/upload_image`): Should return 200 OK with `{ "imageUrl": "..." }`.
2.  [ ] **Frontend Data Loading:**
    *   GET (e.g., `/api/hero_slides`, `/api/programs`, `/api/programs_page`): Should return 200 OK with data.

### C. Check for Failed API Calls
1.  [ ] Look for any HTTP status codes like 4xx (e.g., 400 Bad Request, 401 Unauthorized, 404 Not Found) or 5xx (e.g., 500 Internal Server Error).
    *   *Expected:* No unexpected 4xx or 5xx errors. If they occur, investigate the Azure Function logs for details.

### D. Verify Payloads and Responses
1.  [ ] For POST/PUT requests from the admin panel, briefly inspect the request payload in the Network tab to ensure it contains the correct data being sent to the API.
2.  [ ] For GET requests, briefly inspect the response data to ensure it looks like the expected content from Cosmos DB.

## IV. Cross-Browser Compatibility

### A. Admin Panel
1.  [ ] Perform key operations on latest versions of Chrome, Firefox, Edge, Safari:
    *   Login & Logout.
    *   Create, Edit (with image change), and Delete one Hero Slide.
    *   Edit Programs Page Hero.

### B. Frontend Website
1.  [ ] View key pages (Homepage, Programs page) on latest versions of Chrome, Firefox, Edge, Safari.
    *   *Expected:* Pages render correctly, images display, layout is consistent.

This checklist aims to be thorough. Depending on the complexity and criticality, some tests might be prioritized over others. Remember to replace placeholder values in environment variables for your Azure Functions before testing the API endpoints.The `TESTING_CHECKLIST.MD` file has been successfully created with the comprehensive checklist.
This checklist covers:
-   Admin Panel Testing (Authentication, Hero Slides, Programs Page Hero, Program Cards, General UI/UX)
-   Frontend Website Testing (Homepage, Programs Page, Other CMS pages, General UI/UX)
-   API Functionality (via browser dev tools)
-   Cross-Browser Compatibility

The subtask is complete.
