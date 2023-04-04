import COS from 'cos-nodejs-sdk-v5'

export interface ICosFileUploadInfo {
  statusCode: number
  headers: Record<string, string>
  Location: string
  ETag: string
  RequestId: string
}

export interface IUploadFileByPathOptions {
  /** 是否使用 oss.paperplane.cc 域名  */
  usePaperplaneDomain?: boolean
}

/** 上传文件到存储桶，需指定存储路径和本地文件路径 */
export async function uploadFileByPath(
  key: string,
  filePath: string,
  options?: IUploadFileByPathOptions
): Promise<ICosFileUploadInfo> {
  const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  })
  const { usePaperplaneDomain } = Object.assign({}, options)

  return new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: 'paperplane-1253277322',
        Region: 'ap-shanghai',
        Key: key,
        FilePath: filePath,
      },
      function (err, data: ICosFileUploadInfo) {
        if (err) {
          reject(err)
        } else {
          let fileUrl = 'https://' + data.Location
          if (usePaperplaneDomain) {
            fileUrl = fileUrl.replace(
              'paperplane-1253277322.cos.ap-shanghai.myqcloud.com',
              'oss.paperplane.cc'
            )
          }
          resolve({ ...data, Location: fileUrl })
        }
      }
    )
  })
}
