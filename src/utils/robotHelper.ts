import { Client } from '@larksuiteoapi/node-sdk'
import axios from 'axios'
import crypto from 'crypto'
import sharp from 'sharp'
import { Readable } from 'stream'

export async function feishuUpload(
  imageUrl: string,
  appId: string,
  appSecret: string
): Promise<string> {
  const client = new Client({
    appId,
    appSecret,
    disableTokenCache: false,
  })

  const image = await axios.get(imageUrl, { responseType: 'arraybuffer' }).then(res => res.data)

  return client.im.image
    .create({
      data: {
        image_type: 'message',
        // @ts-ignore 在 Node.js 18 中使用 Buffer 会报错，参考 https://github.com/larksuite/node-sdk/issues/39
        image: Readable.from(image),
      },
    })
    .then(res => res.image_key)
}

async function defaultReduceSizeByFile(file: Buffer): Promise<Buffer> {
  return sharp(file).toFormat('jpeg').toBuffer()
}

export interface IHandleWxBizImageOption {
  /** 微信机器人文件不能大于 2M，默认提供了基于图片文件处理体积的流程，可在此处覆盖 */
  overrideReduceSizeByFileFn?: typeof defaultReduceSizeByFile
}

/** 微信机器人发送图片需要 base64 和 md5，且文件不能大于 2M，可用此方法处理 */
export async function handleWxBizImage(
  imageUrl: string,
  options?: IHandleWxBizImageOption
): Promise<{ base64: string; md5: string }> {
  const { overrideReduceSizeByFileFn: reduceSizeFn } = {
    overrideReduceSizeByFileFn: defaultReduceSizeByFile,
    ...options,
  }

  const file = await axios
    .get(imageUrl, { responseType: 'arraybuffer' })
    .then(res => Buffer.from(res.data))
    .then(reduceSizeFn)

  const hash = crypto.createHash('md5')
  hash.update(file)
  const md5 = hash.digest('hex')

  const base64 = file.toString('base64')

  return { md5, base64 }
}
