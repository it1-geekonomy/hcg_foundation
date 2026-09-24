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
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
    const key = `website/${Date.now()}-${safeName}`;

    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return NextResponse.json({
      key,
      url: `${publicUrl}/${key}`,
      size: buffer.length,
      contentType: file.type,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url || !url.startsWith(publicUrl)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    
    const key = url.slice(publicUrl.length + 1);
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
