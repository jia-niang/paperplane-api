import crypto from 'crypto'
import dayjs from 'dayjs'

export function dingtalkRobotSign(secret: string, timestamp: number = dayjs().valueOf()) {
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${timestamp}\n${secret}`)
  const sign = encodeURIComponent(hmac.digest('base64'))

  return { sign, timestamp }
}

export function feishuRobotSign(secret: string, timestamp: number = dayjs().unix()) {
  const hmac = crypto.createHmac('sha256', `${timestamp}\n${secret}`)
  hmac.update('')
  const sign = hmac.digest('base64')

  return { sign, timestamp }
}
