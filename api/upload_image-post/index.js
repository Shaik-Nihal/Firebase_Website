// api/upload_image-post/index.js
const { BlobServiceClient } = require("@azure/storage-blob");
const multiparty = require('multiparty');
const streamToBuffer = require('./streamToBuffer');

const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "cms-images"; // Ensure this matches your admin panel setup

if (!storageConnectionString) {
    console.warn("Azure Storage Connection String (AZURE_STORAGE_CONNECTION_STRING) not set in environment variables. Image uploads will fail.");
}

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed an image upload request.');

    if (!storageConnectionString) {
        context.res = { status: 500, body: "Storage not configured. Administrator check environment variables." };
        return;
    }

    const form = new multiparty.Form();

    try {
        const {fields, files} = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    context.log.error("Multiparty parsing error: ", err);
                    reject(err);
                }
                else resolve({fields, files});
            });
        });

        if (!files.image || !files.image[0]) {
            context.res = { status: 400, body: "No image file found in request. Ensure the form field name is 'image'." };
            return;
        }

        const file = files.image[0];
        // Generate a unique name for the blob to avoid overwrites
        const blobName = new Date().getTime() + '-' + file.originalFilename.replace(/[^a-zA-Z0-9.]/g, '_'); // Sanitize filename

        const blobServiceClient = BlobServiceClient.fromConnectionString(storageConnectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        // Ensure container exists - for production, container should be pre-created.
        // await containerClient.createIfNotExists({ access: 'blob' }); // 'blob' for public read access via URL

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        const buffer = await streamToBuffer(file.path);

        await blockBlobClient.uploadData(buffer, {
            blobHTTPHeaders: { blobContentType: file.headers['content-type'] || 'application/octet-stream' }
        });

        context.log(`Image ${blobName} uploaded to ${containerName}. URL: ${blockBlobClient.url}`);
        context.res = { status: 200, body: { imageUrl: blockBlobClient.url } };

    } catch (error) {
        context.log.error("Upload error: ", error);
        let errorMessage = "Image upload failed.";
        if (error.message && typeof error.message === 'string') {
            if (error.message.includes("getaddrinfo ENOTFOUND")) {
                 errorMessage = "Storage endpoint misconfiguration or DNS issue.";
            } else if (error.message.includes("AuthenticationFailed")) {
                 errorMessage = "Storage authentication failed. Check connection string or SAS token validity.";
            } else {
                 errorMessage = error.message;
            }
        } else if (error.details && error.details.message) { // multiparty errors might be structured differently
            errorMessage = error.details.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        context.res = { status: 500, body: `Image upload failed: ${errorMessage}` };
    }
};
