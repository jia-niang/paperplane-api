import { createHash } from 'crypto'
import { padStart } from 'lodash'

export function internalGenerateShortsKey(url: string, offset: number = 0): string {
  const hash = createHash('sha256')
  hash.update(url)
  const urlHashResult = hash.digest('hex').slice(-6)
  const result = numberToBase64Url(Number('0x' + urlHashResult), offset)
    .slice(-4)
    .padStart(4, '0')

  return result
}

export function userGenerateShortsKey(url: string, offset: number = 0): string {
  const hash = createHash('sha256')
  hash.update(url)
  const urlHashResult = hash.digest('hex').slice(-9)
  const result = numberToBase64Url(Number('0x' + urlHashResult), offset)
    .slice(-6)
    .padStart(6, '0')

  return result
}

const base64UrlAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

export function blogKeyToUrlHex(key: string): string {
  try {
    let resultNum = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charAt(i)
      const index = base64UrlAlphabet.indexOf(char)
      const power = key.length - i - 1
      resultNum += index * Math.pow(64, power)
    }
    const result = padStart(resultNum.toString(16), 12, '0')

    return result
  } catch {
    return null
  }
}

function numberToBase64Url(number: number, offset?: number): string {
  let num = number + (offset || 0)
  let result = ''
  do {
    result = base64UrlAlphabet[num % 64] + result
    num = Math.floor(num / 64)
  } while (num > 0)

  return result
}
