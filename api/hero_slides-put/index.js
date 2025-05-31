// api/hero_slides-put/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.HERO_CONTAINER_ID || "hero_section";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for hero_slides-put.');

    const itemId = req.params.id;
    if (!itemId) {
        context.res = { status: 400, body: "Please pass an item ID in the route" };
        return;
    }

    if (!client) {
        context.log.error("Cosmos DB client not initialized.");
        context.res = { status: 500, body: "Cosmos DB client not initialized." };
        return;
    }
    if (!databaseId) {
        context.log.error("Cosmos DB databaseId not set.");
        context.res = { status: 500, body: "Cosmos DB database ID not configured." };
        return;
    }

    const itemData = req.body;
    if (!itemData) {
        context.res = { status: 400, body: "Please pass item data in the request body" };
        return;
    }

    // Ensure the ID in the body matches the ID in the route, or is not present in body
    if (itemData.id && itemData.id !== itemId) {
        context.res = { status: 400, body: "Item ID in body does not match ID in route." };
        return;
    }
    itemData.id = itemId; // Ensure the ID from the route is used

    itemData.updatedAt = new Date().toISOString();
    // Ensure `order` is a number if provided
     if (itemData.order && typeof itemData.order !== 'number') {
        try {
            itemData.order = parseInt(itemData.order);
            if (isNaN(itemData.order)) delete itemData.order; // Remove if parsing fails, or set default
        } catch {
            delete itemData.order;
        }
    }

    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        // For replace, we need the item's partition key. Assuming 'id' is the partition key.
        // If not, the client (admin panel) would need to send the partition key value,
        // or we'd need to fetch the item first to get its partition key if it's not 'id'.
        // For this example, we'll assume the partition key path for hero_slides is /id.
        const { resource: updatedItem } = await container.item(itemId, itemId).replace(itemData);

        if (updatedItem) {
            context.res = { status: 200, body: updatedItem };
        } else {
            // This path might not be hit if replace throws an error for non-existent item.
            context.res = { status: 404, body: "Item not found." };
        }
    } catch (error) {
        context.log.error("Error in hero_slides-put: ", error);
        if (error.code === 404) {
            context.res = { status: 404, body: "Item not found to update." };
        } else {
            context.res = { status: 500, body: error.message };
        }
    }
};
