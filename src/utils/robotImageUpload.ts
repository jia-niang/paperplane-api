import { Client } from '@larksuiteoapi/node-sdk'

export async function feishuUpload(
  image: Buffer,
  appId: string,
  appSecret: string
): Promise<string> {
  const client = new Client({
    appId,
    appSecret,
    disableTokenCache: false,
  })

  return client.im.image
    .create({ data: { image_type: 'message', image: Buffer.from(image) } })
    .then(res => res.image_key)
}
