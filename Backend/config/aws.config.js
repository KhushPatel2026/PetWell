const { S3Client, PutBucketLifecycleConfigurationCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const configureLifecycle = async () => {
  try {
    await s3Client.send(new PutBucketLifecycleConfigurationCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      LifecycleConfiguration: {
        Rules: [
          {
            ID: 'MoveToInfrequentAccess',
            Status: 'Enabled',
            Filter: { Prefix: 'documents/' },
            Transitions: [
              { Days: 30, StorageClass: 'STANDARD_IA' },
              { Days: 90, StorageClass: 'GLACIER' }
            ]
          },
          {
            ID: 'DeleteExpired',
            Status: 'Enabled',
            Filter: { Prefix: 'temp/' },
            Expiration: { Days: 7 }
          }
        ]
      }
    }));
    console.log('S3 lifecycle configuration applied');
  } catch (error) {
    console.error('S3 lifecycle error:', error);
  }
};

configureLifecycle();

module.exports = s3Client;