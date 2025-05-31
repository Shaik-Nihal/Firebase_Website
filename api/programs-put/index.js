// api/programs-put/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.PROGRAMS_CONTAINER_ID || "programs";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for programs-put.');

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

    if (itemData.id && itemData.id !== itemId) {
        context.res = { status: 400, body: "Item ID in body does not match ID in route." };
        return;
    }
    itemData.id = itemId;
    itemData.updatedAt = new Date().toISOString();
    if (itemData.order && typeof itemData.order !== 'number') {
        try {
            itemData.order = parseInt(itemData.order);
            if (isNaN(itemData.order)) delete itemData.order;
        } catch {
            delete itemData.order;
        }
    }

    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);
        // Assuming 'id' is the partition key for programs container.
        const { resource: updatedItem } = await container.item(itemId, itemId).replace(itemData);

        if (updatedItem) {
            context.res = { status: 200, body: updatedItem };
        } else {
            context.res = { status: 404, body: "Item not found." };
        }
    } catch (error) {
        context.log.error("Error in programs-put: ", error);
        if (error.code === 404) {
            context.res = { status: 404, body: "Item not found to update." };
        } else {
            context.res = { status: 500, body: error.message };
        }
    }
};
