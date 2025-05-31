// api/programs-get/index.js
const { client, databaseId } = require("../shared/cosmosdb-client");
const containerId = process.env.PROGRAMS_CONTAINER_ID || "programs";

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request for programs-get.');
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
        const querySpec = { query: "SELECT * FROM c ORDER BY c.order ASC" };
        const { resources: items } = await container.items.query(querySpec).fetchAll();
        context.res = { status: 200, body: items };
    } catch (error) {
        context.log.error("Error in programs-get: ", error);
        context.res = { status: 500, body: error.message };
    }
};
