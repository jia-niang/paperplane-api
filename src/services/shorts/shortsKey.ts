import { createHash } from 'crypto'

export function internalGenerateShortsKey(url: string, offset: number = 0): string {
  const hash = createHash('sha256')
  hash.update(url)
  const urlHashResult = hash.digest('hex').slice(-8)
  const result = numberToCrockford(Number('0x' + urlHashResult), offset).slice(-4)

  return result
}

export function userGenerateShortsKey(url: string, offset: number = 0): string {
  const hash = createHash('sha256')
  hash.update(url)
  const urlHashResult = hash.digest('hex').slice(-16)
  const result = numberToCrockford(Number('0x' + urlHashResult), offset).slice(-8)

  return result
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function hexToBinaryString(hex: number, offset?: number): string {
  offset = offset || 0

  const hexString = (hex + offset).toString(16)

  // 将十六进制字符串转换为字节数组
  const byteArray = hexString.match(/.{2}/g).map(byte => parseInt(byte, 16))
  // 将每个字节转换为 8 位二进制字符串，并连接起来
  const binaryString = byteArray.reduce((acc, byte) => acc + byte.toString(2).padStart(8, '0'), '')

  return binaryString
}

function numberToCrockford(number: number, offset?: number): string {
  offset = offset || 0

  let binaryString = (number + offset).toString(2)
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'.toLowerCase()

  // 补齐到能被 5 整除，因为 5 个比特位正好是一个 Base32 字符
  while (binaryString.length % 5 !== 0) {
    binaryString = '0' + binaryString
  }

  // 按照 5 位一组分组，将它转为 32 进制表示形式
  let result = ''
  for (let i = 0; i < binaryString.length; i += 5) {
    const chunk = binaryString.slice(i, i + 5)
    const index = parseInt(chunk, 2)
    result += alphabet[index]
  }

  return result
}
