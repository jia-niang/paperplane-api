import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { trimStart } from 'lodash'
import mimeLib from 'mime'

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: false,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

export interface IUploadFileOption {
  /** 文件 url 不带协议名前缀，会以 //: 开头 */
  withoutProtocolPrefix?: boolean
  /** 自定义文件的 mime */
  mime?: string
}

export interface IUploadFileResult {
  /** 对象存储中的文件 url */
  fileUrl: string
}

/** 上传文件到存储桶，需指定存储桶中的路径和文件内容 Buffer */
export async function uploadFile(
  key: string,
  fileBuffer: Buffer,
  options?: IUploadFileOption
): Promise<IUploadFileResult> {
  const { withoutProtocolPrefix, mime } = Object.assign({}, options)

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Body: fileBuffer,
    Key: trimStart(key, '/'),
    ContentType: mime || mimeLib.getType(key),
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

export interface IUploadFilePreSignOption extends IUploadFileOption {
  /** 过期时间秒数，默认为 `600`，也就是 10 分钟 */
  expiresIn?: number
}

export interface IUploadFilePreSignResult {
  /** 预签名 S3 上传地址，请使用 PUT 上传 */
  preSignUrl: string
  /** 上传成功后，访问文件的路径 */
  publicUrl: string
}

/** 生成预签名的上传文件 url */
export async function uploadFilePreSign(
  key: string,
  options?: IUploadFilePreSignOption
): Promise<IUploadFilePreSignResult> {
  const { expiresIn, mime, withoutProtocolPrefix } = Object.assign<IUploadFilePreSignOption, any>(
    { expiresIn: 600 },
    options
  )

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: trimStart(key, '/'),
    ContentType: mime,
  })

  const preSignUrl = await getSignedUrl(s3Client, uploadCommand, { expiresIn })

  let publicUrl = `https://cdn.paperplane.cc/${trimStart(key, '/')}`
  if (withoutProtocolPrefix) {
    publicUrl = trimStart(publicUrl, 'https')
    publicUrl = trimStart(publicUrl, 'http')
  }

  return { preSignUrl, publicUrl }
}
