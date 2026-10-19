import { S3Client } from '@aws-sdk/client-s3';

export const CAR_IMAGES_BUCKET = 'car-images';

type StorageConfiguration = {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
};

let client: S3Client | undefined;

function getStorageConfiguration(): StorageConfiguration {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const endpoint = process.env.AWS_ENDPOINT_URL_S3?.replace(/\/+$/, '');
  const region = process.env.AWS_REGION;
  const missing: string[] = [];
  if (!accessKeyId) missing.push('AWS_ACCESS_KEY_ID');
  if (!secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY');
  if (!endpoint) missing.push('AWS_ENDPOINT_URL_S3');
  if (!region) missing.push('AWS_REGION');

  if (missing.length > 0) {
    throw new Error(`Missing object storage configuration: ${missing.join(', ')}`);
  }

  if (!accessKeyId || !secretAccessKey || !endpoint || !region) {
    throw new Error('Object storage configuration validation failed.');
  }

  return {
    accessKeyId,
    secretAccessKey,
    endpoint,
    region,
  };
}

export function getStorageClient(): S3Client {
  if (!client) {
    const config = getStorageConfiguration();
    client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }

  return client;
}

export function getPublicImageUrl(key: string): string {
  const { endpoint } = getStorageConfiguration();
  const url = new URL(`${endpoint}/`);
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${CAR_IMAGES_BUCKET}/${encodedKey}`;
  return url.toString();
}
