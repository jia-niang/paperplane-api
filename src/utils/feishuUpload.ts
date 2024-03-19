import { Client } from '@larksuiteoapi/node-sdk'
import { Readable } from 'stream'

export function feishuUpload(image: Buffer, appId: string, appSecret: string) {
  const client = new Client({
    appId,
    appSecret,
    disableTokenCache: false,
  })

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
