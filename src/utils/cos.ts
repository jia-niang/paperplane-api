import AWS from 'aws-sdk'
import { trimStart } from 'lodash'

export interface ICosFileUploadInfo extends AWS.S3.ManagedUpload.SendData {}

export interface IUploadFileByPathOptions {
  /** 是否使用 oss.paperplane.cc 域名  */
  usePaperplaneDomain?: boolean
}

/** 上传文件到存储桶，需指定存储桶中的路径和文件内容 Buffer */
export async function uploadFile(
  key: string,
  fileBuffer: Buffer,
  options?: IUploadFileByPathOptions
): Promise<AWS.S3.ManagedUpload.SendData> {
  const s3 = new AWS.S3({
    accessKeyId: process.env.COS_SECRET_ID,
    secretAccessKey: process.env.COS_SECRET_KEY,
    region: 'ap-hongkong',
    endpoint: 'https://cos.ap-hongkong.myqcloud.com',
    apiVersion: '2006-03-01',
  })

  const { usePaperplaneDomain } = Object.assign({}, options)

  return new Promise((resolve, reject) => {
    s3.upload(
      { Bucket: 'paperplane-cdn-1253277322', Key: trimStart(key, '/'), Body: fileBuffer },

      function (err, data) {
        if (err) {
          reject(err)
        } else {
          let fileUrl = data.Location
          if (usePaperplaneDomain) {
            fileUrl = fileUrl.replace(
              'paperplane-cdn-1253277322.cos.ap-hongkong.myqcloud.com',
              'cdn.paperplane.cc'
            )
          }

          resolve({ ...data, Location: fileUrl })
        }
      }
    )
  })
}
