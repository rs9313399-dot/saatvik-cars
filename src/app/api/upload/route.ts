import { randomUUID } from 'node:crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { CAR_IMAGES_BUCKET, getPublicImageUrl, getStorageClient } from '@/lib/storage';

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request: NextRequest) {
  try {
    if (!(await checkAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const contentType = body?.contentType;
    if (typeof contentType !== 'string' || !IMAGE_EXTENSIONS[contentType]) {
      return NextResponse.json(
        { error: 'Use a JPEG, PNG, or WebP image.' },
        { status: 400 },
      );
    }

    const objectPath = `car-listings/${randomUUID()}.${IMAGE_EXTENSIONS[contentType]}`;
    const uploadUrl = await getSignedUrl(
      getStorageClient(),
      new PutObjectCommand({
        Bucket: CAR_IMAGES_BUCKET,
        Key: objectPath,
        ContentType: contentType,
      }),
      { expiresIn: 300 },
    );

    return NextResponse.json(
      {
        uploadUrl,
        path: getPublicImageUrl(objectPath),
        contentType,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Car photo upload authorization failed:', error);
    return NextResponse.json(
      { error: 'Car photo upload could not be authorized. Check object storage configuration.' },
      { status: 502 },
    );
  }
}
