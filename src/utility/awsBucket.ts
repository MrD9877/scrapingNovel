import dotenv from "dotenv";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

dotenv.config();

const bucketName = process.env.BUCKET_NAME || "";
const bucketRegion = process.env.BUCKET_REGION || "";
const bucketAccess = process.env.BUCKET_ACCESS_KEY || "";
const bucketSecret = process.env.BUCKET_SECRET_KEY || "";

const s3 = new S3Client({
  credentials: {
    accessKeyId: bucketAccess,
    secretAccessKey: bucketSecret,
  },
  region: bucketRegion,
});

export const uploadImage = async (data: Buffer<ArrayBufferLike>, imageId: string) => {
  const params = {
    Bucket: bucketName,
    Key: imageId,
    Body: data,
    ContentType: "png",
  };
  const commad = new PutObjectCommand(params);
  await s3.send(commad);
  console.log("image on s3");
};

export const testJest = () => {
  return "webnovel-d";
};
