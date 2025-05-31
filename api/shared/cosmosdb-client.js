// api/shared/cosmosdb-client.js
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE_ID;

if (!endpoint || !key || !databaseId) {
    console.warn("Cosmos DB environment variables not fully set. Functions relying on Cosmos DB might not work.");
}

const options = {
    endpoint: endpoint,
    key: key,
    userAgentSuffix: "CmsFunctions"
};

const client = (endpoint && key) ? new CosmosClient(options) : null; // Initialize client only if endpoint and key are present

module.exports = { client, databaseId };
