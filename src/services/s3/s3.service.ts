import { Injectable } from '@nestjs/common'
import { endsWith, trimEnd } from 'lodash'
import { extname } from 'path'

import { isTruly } from '@/utils/formHelper'
import { uploadFile, uploadFilePreSign } from '@/utils/s3'

import { IS3UploadBody } from './s3.controller'

@Injectable()
export class S3Service {
  constructor() {}

  /** 上传文件 */
  async upload(options: IS3UploadBody, file: Express.Multer.File) {
    let uploadKey: string

    if (options.key && isTruly(options.autoKeySuffix)) {
      const originExtName = extname(file.originalname)
      uploadKey = options.key.endsWith(originExtName)
        ? options.key
        : trimEnd(options.key, '.') + originExtName
    } else {
      uploadKey = endsWith(options.path, '/')
        ? `${options.path}${file.originalname}`
        : `${options.path}/${file.originalname}`
    }

    return uploadFile(uploadKey, file.buffer, { mime: file.mimetype }).then(res => res.fileUrl)
  }

  /** 生成预签名的上传文件 url */
  async uploadSign(key: string) {
    return uploadFilePreSign(key)
  }
}
