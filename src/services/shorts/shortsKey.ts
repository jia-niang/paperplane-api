import { padStart, sample } from 'lodash'

const shortsKeyAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function internalGenerateShortsKey(): string {
  let randomString = ''
  for (let i = 0; i < 4; i++) {
    randomString += sample(shortsKeyAlphabet)
  }

  return randomString
}

export function userGenerateShortsKey(): string {
  let randomString = ''
  for (let i = 0; i < 6; i++) {
    randomString += sample(shortsKeyAlphabet)
  }

  return randomString
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
