import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { AdminRole } from '@/app/role.decorator'

import { S3Service } from './s3.service'

export type IS3UploadBody = {
  /** 使用 key 时是否自动判断并设置后缀 */
  autoKeySuffix?: any
} & (
  | {
      /** 指定 S3 中的存储 key */
      key: string
      /** 指定 S3 中的存储路径，自动拼接文件名 */
      path?: string
    }
  | { key?: string; path: string }
)

@Controller('/s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @AdminRole()
  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@Body() body: IS3UploadBody, @UploadedFile() file: Express.Multer.File) {
    return this.s3Service.upload(body, file)
  }

  @AdminRole()
  @Post('/upload-sign')
  async uploadSign(@Body() body: { key: string }) {
    return this.s3Service.uploadSign(body.key)
  }
}
