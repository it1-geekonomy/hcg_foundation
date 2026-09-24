import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

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

export async function GET() {
  try {
    const objects = [];
    let isTruncated = true;
    let continuationToken = undefined;

    while (isTruncated) {
      const response = await client.send(
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!["webp", "avif"].includes(ext || "") && !["image/webp", "image/avif"].includes(file.type)) {
          throw new Error(`Invalid file type for ${file.name}. Only WEBP and AVIF are allowed.`);
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
        const key = `website/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;

        await client.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: file.type,
          })
        );

        return {
          key,
          url: `${publicUrl}/${key}`,
          size: buffer.length,
          contentType: file.type,
        };
      })
    );

    return NextResponse.json({ uploaded });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
