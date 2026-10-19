import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type StorageBucket = {
  public?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    if (!(await checkAuth(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'car-images';

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Image storage is not configured on the server.' },
        { status: 503 },
      );
    }

    if (!request.headers.get('content-type')?.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Send one image as multipart form data.' }, { status: 400 });
    }

    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File)) {
      return NextResponse.json({ error: 'No image file was provided.' }, { status: 400 });
    }

    const extension = IMAGE_EXTENSIONS[image.type];
    if (!extension) {
      return NextResponse.json(
        { error: 'Use a JPEG, PNG, or WebP image.' },
        { status: 400 },
      );
    }

    if (image.size === 0 || image.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Each image must be between 1 byte and 4 MB.' },
        { status: 400 },
      );
    }

    const storageHeaders = {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    };
    const bucketResponse = await fetch(
      `${supabaseUrl}/storage/v1/bucket/${encodeURIComponent(bucketName)}`,
      { headers: storageHeaders, cache: 'no-store' },
    );

    if (!bucketResponse.ok) {
      return NextResponse.json(
        { error: `Supabase Storage bucket "${bucketName}" is missing or unavailable.` },
        { status: 503 },
      );
    }

    const bucket = await bucketResponse.json() as StorageBucket;
    if (bucket.public !== true) {
      return NextResponse.json(
        { error: `Supabase Storage bucket "${bucketName}" must be public for car photos.` },
        { status: 503 },
      );
    }

    const objectPath = `car-listings/${randomUUID()}.${extension}`;
    const uploadResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucketName)}/${objectPath}`,
      {
        method: 'POST',
        headers: {
          ...storageHeaders,
          'Content-Type': image.type,
          'x-upsert': 'false',
        },
        body: await image.arrayBuffer(),
        cache: 'no-store',
      },
    );

    if (!uploadResponse.ok) {
      console.error('Supabase Storage rejected a car photo upload:', uploadResponse.status);
      return NextResponse.json(
        { error: `Supabase Storage rejected the image (HTTP ${uploadResponse.status}).` },
        { status: 502 },
      );
    }

    const publicImageUrl = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucketName)}/${objectPath}`;
    return NextResponse.json({ paths: [publicImageUrl] }, { status: 201 });
  } catch (error) {
    console.error('Car photo upload failed:', error);
    return NextResponse.json(
      { error: 'Car photo upload failed. Check the Supabase Storage configuration and try again.' },
      { status: 502 },
    );
  }
}
