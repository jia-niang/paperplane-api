import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { trimStart } from 'lodash'
import mime from 'mime'

export interface IUploadFileByPathOptions {
  /** 文件 url 不带协议名前缀，会以 //: 开头 */
  withoutProtocolPrefix?: boolean
}

export interface IUploadFileResult {
  /** 对象存储中的文件 url */
  fileUrl: string
}

/** 上传文件到存储桶，需指定存储桶中的路径和文件内容 Buffer */
export async function uploadFile(
  key: string,
  fileBuffer: Buffer,
  options?: IUploadFileByPathOptions
): Promise<IUploadFileResult> {
  const { withoutProtocolPrefix } = Object.assign({}, options)

  const s3Client = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: false,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  })

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Body: fileBuffer,
    Key: trimStart(key, '/'),
    ContentType: mime.getType(key),
  })

  await s3Client.send(uploadCommand)

  let fileUrl = `https://cdn.paperplane.cc/${trimStart(key, '/')}`
  if (withoutProtocolPrefix) {
    fileUrl = trimStart(fileUrl, 'https')
    fileUrl = trimStart(fileUrl, 'http')
  }
  const result = {
    fileUrl,
  }

  return result
}
