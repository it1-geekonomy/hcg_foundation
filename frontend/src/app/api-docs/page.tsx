"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

const spec = {
  openapi: "3.0.0",
  info: {
    title: "Website Images API (Frontend)",
    version: "1.0.0",
    description: "Simple API route in the frontend Next.js server to directly upload and delete images in R2. No JWT required.",
  },
  paths: {
    "/api/website-images": {
      get: {
        summary: "List all website images",
        responses: {
          "200": {
            description: "A list of images",
          },
        },
      },
      post: {
        summary: "Upload a website image",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Upload success",
          },
        },
      },
      delete: {
        summary: "Delete a website image",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  url: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Delete success",
          },
        },
      },
    },
  },
};

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI spec={spec} />
    </div>
  );
}
