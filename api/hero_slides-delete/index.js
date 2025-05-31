// api/hero_slides-delete/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.HERO_CONTAINER_ID || "hero_section";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for hero_slides-delete.');

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

    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        // Assuming 'id' is the partition key for hero_slides.
        // If not, the correct partitionKey value would be needed here.
        await container.item(itemId, itemId).delete();

        context.res = { status: 204, body: "Item deleted successfully." }; // 204 No Content for successful delete

    } catch (error) {
        context.log.error("Error in hero_slides-delete: ", error);
        if (error.code === 404) {
            context.res = { status: 404, body: "Item not found to delete." };
        } else {
            context.res = { status: 500, body: error.message };
        }
    }
};
