import COS from 'cos-nodejs-sdk-v5'

export const cos = new COS({
  SecretId: 'AKIDpW4QdkWK34335yhuvmU2RhmuqcDblmaC',
  SecretKey: 'bv3xfBe0pnjYItcDdsu7IJXfdZJwg0IZ',
})

export interface ICosFileUploadInfo {
  statusCode: number
  headers: Record<string, string>
  Location: string
  ETag: string
  RequestId: string
}

/** 上传文件到存储桶，需指定存储路径和本地文件路径 */
export async function uploadFileByPath(key: string, filePath: string): Promise<ICosFileUploadInfo> {
  return new Promise((resolve, reject) => {
    cos.uploadFile(
      {
        Bucket: 'paperplane-1253277322',
        Region: 'ap-shanghai',
        Key: key,
        FilePath: filePath,
      },
      function (err, data) {
        if (err) {
          reject(err)
        } else {
          resolve(data as ICosFileUploadInfo)
        }
      }
    )
  })
}
