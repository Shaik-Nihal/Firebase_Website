// api/programs_page-get/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.PROGRAMS_PAGE_CONTAINER_ID || "programs_page";
const singleItemId = "main_content"; // ID for the single document in this container

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for programs_page-get.');
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

        // Assuming the partition key for 'programs_page' container is '/id'.
        // Thus, for the item 'main_content', its partition key value is also 'main_content'.
        const { resource: item } = await container.item(singleItemId, singleItemId).read();

        if (item) {
            context.res = { status: 200, body: item };
        } else {
            // This case might not be reached if .read() throws a 404 error for non-existent item
            context.res = { status: 404, body: "Programs page content not found." };
        }
    } catch (error) {
        context.log.error("Error in programs_page-get: ", error);
        if (error.code === 404) {
            // Send a default structure or a specific message if the item isn't found,
            // allowing the client to handle it gracefully.
            context.res = {
                status: 200, // Or 404 if client explicitly checks for it
                body: {
                    id: singleItemId,
                    heroTitle: "Our Programs (Default)",
                    heroParagraph: "Explore our comprehensive range of healthcare education programs (Default)."
                }
            };
        } else {
            context.res = { status: 500, body: error.message };
        }
    }
};
