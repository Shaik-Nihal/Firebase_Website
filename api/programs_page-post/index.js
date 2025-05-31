// api/programs_page-post/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.PROGRAMS_PAGE_CONTAINER_ID || "programs_page";
const singleItemId = "main_content"; // ID for the single document

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for programs_page-post (upsert).');
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

    // Ensure the ID is set to the fixed ID for this singleton document
    itemData.id = singleItemId;
    itemData.lastUpdated = new Date().toISOString();

    // Add any other necessary validation or default fields
    if (typeof itemData.heroTitle === 'undefined') itemData.heroTitle = "";
    if (typeof itemData.heroParagraph === 'undefined') itemData.heroParagraph = "";


    try {
        const database = client.database(databaseId);
        const container = database.container(containerId);

        // Upsert will create the item if it doesn't exist, or update it if it does.
        // The partition key is assumed to be '/id', so 'main_content' is also the partition key value.
        const { resource: upsertedItem } = await container.items.upsert(itemData);

        context.res = { status: 200, body: upsertedItem }; // 200 OK for upsert success (can also be 201 if created)
    } catch (error) {
        context.log.error("Error in programs_page-post (upsert): ", error);
        context.res = { status: 500, body: error.message };
    }
};
