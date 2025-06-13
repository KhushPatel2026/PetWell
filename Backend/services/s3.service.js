const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('../config/aws.config');

const uploadFile = async (file, prefix) => {
  const key = `${prefix}/${Date.now()}-${file.originalname}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  });

  await s3Client.send(command);
  return { key };
};

const getSignedUrlForFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });

  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

const getFile = async (key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  });

  const response = await s3Client.send(command);
  return {
    Body: response.Body,
    ContentType: response.ContentType
  };
};

module.exports = { uploadFile, getSignedUrl: getSignedUrlForFile, getFile };