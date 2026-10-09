import { NextRequest, NextResponse } from "next/server";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";

// Configure S3 client directly in the frontend Next.js server
const client = new S3Client({
  region: process.env.R2_REGION || "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const bucket = process.env.R2_BUCKET_NAME!;
const publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

const ALLOWED_TYPES: Record<string, string> = {
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  webm: "video/webm",
};

// Must stay within nginx client_max_body_size (100m) in production
const MAX_FILE_BYTES = 100 * 1024 * 1024;

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

export async function GET() {
  try {
    const objects: { key: string | undefined; url: string; size: number }[] = [];
    let isTruncated = true;
    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const response: ListObjectsV2CommandOutput = await client.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: "website/",
          ContinuationToken: continuationToken,
        })
      );

      response.Contents?.forEach((obj) => {
        if (obj.Key === "website/") return;
        objects.push({
          key: obj.Key,
          url: `${publicUrl}/${obj.Key}`,
          size: obj.Size || 0,
        });
      });
      isTruncated = response.IsTruncated ?? false;
      continuationToken = response.NextContinuationToken;
    }

    return NextResponse.json(objects);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("file") as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
    }

    const uploaded = await Promise.all(
      files.map(async (file) => {
        const ext = file.name.split('.').pop()?.toLowerCase() || "";
        const allowedMime = Object.values(ALLOWED_TYPES);
        if (!ALLOWED_TYPES[ext] && !allowedMime.includes(file.type)) {
          throw new Error(
            `Invalid file type for ${file.name}. Only WEBP, AVIF, MP4 and WEBM are allowed.`
          );
        }
        if (file.size > MAX_FILE_BYTES) {
          throw new Error(`${file.name} is larger than 100 MB.`);
        }

        const contentType = allowedMime.includes(file.type) ? file.type : ALLOWED_TYPES[ext];
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
        const key = `website/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          })
        );

        return {
          key,
          url: `${publicUrl}/${key}`,
          size: buffer.length,
          contentType,
        };
      })
    );

    return NextResponse.json({ uploaded });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const urls = Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : [];
    
    if (urls.length === 0) {
      return NextResponse.json({ error: "URL or URLs array is required" }, { status: 400 });
    }
    
    const objectsToDelete = urls.map((url: string) => {
      if (!url.startsWith(publicUrl)) {
        throw new Error(`Invalid URL: ${url}`);
      }
      return { Key: url.slice(publicUrl.length + 1) };
    });
    
    // AWS SDK DeleteObjectsCommand is more efficient for bulk delete
    const { DeleteObjectsCommand } = await import("@aws-sdk/client-s3");
    
    await client.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: objectsToDelete,
          Quiet: false,
        },
      })
    );
    
    return NextResponse.json({ success: true, deletedCount: objectsToDelete.length });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
