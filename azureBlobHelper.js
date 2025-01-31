const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config({ path: './.env' });

const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME_UPLOAD_IMAGES = process.env.CONTAINER_NAME_UPLOAD_IMAGES; 
const CONTAINER_NAME_INVOICES = process.env.CONTAINER_NAME_INVOICES;
if (!AZURE_STORAGE_CONNECTION_STRING) {
  throw new Error('Azure Storage Connection string not found');
}

const uploadBase64Image = async (base64Image, filename) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_UPLOAD_IMAGES);

    const blobName = filename;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'image/jpeg' }, // Set content type
    });
    return blockBlobClient.url; 
  } catch (error) {
    console.error('Error uploading image to Azure Blob Storage:', error);
    throw error;
  }
};

const deleteBlob = async (blobName) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
  const containerClient = blobServiceClient.getContainerClient(process.env.CONTAINER_NAME_UPLOAD_IMAGES);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  try {
    await blockBlobClient.deleteIfExists();
    console.log(`Deleted blob: ${blobName}`);
  } catch (error) {
    console.error(`Error deleting blob ${blobName}:`, error.message);
  }
};

const uploadPdfBuffer = async (buffer, filename) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME_INVOICES); 

    const blockBlobClient = containerClient.getBlockBlobClient(filename);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: 'application/pdf' }, // Set content type to PDF
    });
    return blockBlobClient.url; // Return the URL of the uploaded PDF
  } catch (error) {
    console.error('Error uploading PDF to Azure Blob Storage:', error);
    throw error;
  }
};

module.exports = { uploadBase64Image, deleteBlob, uploadPdfBuffer };
