import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { env } from "./env"

const r2 = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

export async function uploadToR2(
  buffer: ArrayBuffer,
  filename: string,
  contentType: string
): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: filename,
      Body: new Uint8Array(buffer),
      ContentType: contentType,
    })
  )

  return `${env.API_URL}/uploads/${filename}`
}

export async function getFromR2(key: string) {
  const response = await r2.send(new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }))
  return response
}
