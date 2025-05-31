// api/upload_image-post/streamToBuffer.js
const fs = require('fs');

module.exports = (filePath) => { // Removed size parameter as it's not strictly needed by fs.createReadStream
    return new Promise((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        const chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('error', (err) => { // Added error object to reject
            fs.unlink(filePath, unlinkErr => { // Attempt to delete temp file even on stream error
                if(unlinkErr) console.error("Error deleting temp file on stream error:", unlinkErr);
            });
            reject(err);
        });
        stream.on('end', () => {
            resolve(Buffer.concat(chunks));
            fs.unlink(filePath, err => { // Delete temp file after successful read
                if(err) console.error("Error deleting temp file after stream end:", err);
            });
        });
    });
};
