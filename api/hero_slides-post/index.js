// api/hero_slides-post/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.HERO_CONTAINER_ID || "hero_section";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for hero_slides-post.');
    if (!client) {
        context.log.error("Cosmos DB client not initialized. Check environment variables COSMOS_DB_ENDPOINT and COSMOS_DB_KEY.");
        context.res = { status: 500, body: "Cosmos DB client not initialized." };
        return;
    }
    if (!databaseId) {
        context.log.error("Cosmos DB databaseId not set. Check environment variable COSMOS_DB_DATABASE_ID.");
        context.res = { status: 500, body: "Cosmos DB database ID not configured." };
        return;
    }

    const itemData = req.body;
    if (!itemData || !itemData.id) { // Assuming client generates ID for new items
        context.res = { status: 400, body: "Please pass item data with an 'id' in the request body" };
        return;
    }

    // Add server-side validation if necessary
    itemData.createdAt = new Date().toISOString();
    itemData.updatedAt = new Date().toISOString();
    // Ensure `order` is a number if provided, or set a default
    if (itemData.order && typeof itemData.order !== 'number') {
        try {
            itemData.order = parseInt(itemData.order);
            if (isNaN(itemData.order)) itemData.order = 1; // Default if parsing fails
        } catch {
            itemData.order = 1; // Default if field is problematic
        }
    } else if (typeof itemData.order === 'undefined') {
        itemData.order = 1; // Default if not provided
    }


    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const { resource: createdItem } = await container.items.create(itemData);
        context.res = { status: 201, body: createdItem };
    } catch (error) {
        context.log.error("Error in hero_slides-post: ", error);
        // Check for conflict (item with same ID already exists)
        if (error.code === 409) {
            context.res = { status: 409, body: "Item with the same ID already exists." };
        } else {
            context.res = { status: 500, body: error.message };
        }
    }
};
