import AWS from 'aws-sdk'
import { readFileSync } from 'fs'
import { trimStart } from 'lodash'

export interface ICosFileUploadInfo extends AWS.S3.ManagedUpload.SendData {}

export interface IUploadFileByPathOptions {
  /** 是否使用 oss.paperplane.cc 域名  */
  usePaperplaneDomain?: boolean
}

/** 上传文件到存储桶，需指定存储路径和本地文件路径 */
export async function uploadFileByPath(
  key: string,
  filePath: string,
  options?: IUploadFileByPathOptions
): Promise<AWS.S3.ManagedUpload.SendData> {
  const s3 = new AWS.S3({
    accessKeyId: process.env.COS_SECRET_ID,
    secretAccessKey: process.env.COS_SECRET_KEY,
    region: 'ap-shanghai',
    endpoint: 'https://cos.ap-shanghai.myqcloud.com',
    apiVersion: '2006-03-01',
  })

  const { usePaperplaneDomain } = Object.assign({}, options)

  return new Promise((resolve, reject) => {
    const Body = readFileSync(filePath)

    s3.upload(
      { Bucket: 'paperplane-1253277322', Key: trimStart(key, '/'), Body },

      function (err, data) {
        if (err) {
          reject(err)
        } else {
          let fileUrl = data.Location
          if (usePaperplaneDomain) {
            fileUrl = fileUrl.replace(
              'paperplane-1253277322.cos.ap-shanghai.myqcloud.com',
              'oss.paperplane.cc'
            )
          }

          console.log('fileUrl = ', fileUrl)

          resolve({ ...data, Location: fileUrl })
        }
      }
    )
  })
}
