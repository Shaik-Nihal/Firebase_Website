// api/programs-post/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.PROGRAMS_CONTAINER_ID || "programs";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for programs-post.');
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
    if (!itemData || !itemData.id) { // Assuming client generates ID for new items
        context.res = { status: 400, body: "Please pass item data with an 'id' in the request body" };
        return;
    }

    itemData.createdAt = new Date().toISOString();
    itemData.updatedAt = new Date().toISOString();
    if (itemData.order && typeof itemData.order !== 'number') {
        try {
            itemData.order = parseInt(itemData.order);
            if (isNaN(itemData.order)) itemData.order = 1;
        } catch {
            itemData.order = 1;
        }
    } else if (typeof itemData.order === 'undefined') {
        itemData.order = 1;
    }

    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        const { resource: createdItem } = await container.items.create(itemData);
        context.res = { status: 201, body: createdItem };
    } catch (error) {
        context.log.error("Error in programs-post: ", error);
        if (error.code === 409) {
            context.res = { status: 409, body: "Item with the same ID already exists." };
        } else {
            context.res = { status: 500, body: error.message };
        }
    }
};
