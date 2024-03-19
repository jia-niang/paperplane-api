import { Injectable } from '@nestjs/common'
import { MessageRobotType } from '@prisma/client'
import axios from 'axios'
import { PrismaService } from 'nestjs-prisma'

import { feishuUpload } from '@/utils/feishuUpload'

import { feishuRobotSign, dingtalkRobotSign } from './robot-sign'

export interface IMessageRobotAuth {
  accessToken?: string
  secret?: string
}

export interface IMessageExtraAuthentication {
  feishuUploadAppId?: string
  feishuUploadAppSecret?: string
}

export interface IMessageRobotImage {
  url: string
  base64: string
  md5: string
  file: Buffer
}

const wxbizRobotUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=`
const dintalkRobotUrl = `https://oapi.dingtalk.com/robot/send?access_token=`
const feishuRobotUrl = `https://open.feishu.cn/open-apis/bot/v2/hook/`

@Injectable()
export class MessageRobotService {
  constructor(private readonly prisma: PrismaService) {}

  /** 提供机器人 ID，发送纯文本 */
  async sendTextByRobotId(id: string, text: string) {
    const robotConfig = await this.prisma.messageRobot.findFirst({ where: { id } })
    if (!robotConfig) {
      throw new Error(`未找到 ID 为 "${id}" 的消息机器人。`)
    }

    const { type, accessToken, secret } = robotConfig
    const auth = { accessToken, secret }

    if (type === MessageRobotType.DINGTALK) {
      return this.sendByFullConfig(type, { msgtype: 'text', text: { content: text } }, auth)
    } else if (type === MessageRobotType.FEISHU) {
      return this.sendByFullConfig(type, { msg_type: 'text', content: { text } }, auth)
    } else if (type === MessageRobotType.WXBIZ) {
      return this.sendByFullConfig(type, { msgtype: 'text', text: { content: text } }, auth)
    } else {
      throw new Error('未知的机器人类型')
    }
  }

  /** 提供机器人 ID，发送一张图片，可以配置艾特全体 */
  async sendImageByRobotId(
    id: string,
    imageInfo: IMessageRobotImage,
    options?: { atAll?: boolean; dingtalkTitle?: string }
  ) {
    const robotConfig = await this.prisma.messageRobot.findFirst({ where: { id } })
    if (!robotConfig) {
      throw new Error(`未找到 ID 为 "${id}" 的消息机器人。`)
    }

    const { type, extraAuthentication } = robotConfig
    const imageExtraAuthentication = extraAuthentication as IMessageExtraAuthentication

    const { atAll, dingtalkTitle } = { atAll: false, dingtalkTitle: '', ...options }

    if (type === MessageRobotType.DINGTALK) {
      return this.sendByRobotId(id, {
        msgtype: 'markdown',
        markdown: { title: dingtalkTitle, text: `![](${imageInfo.url})` },
        at: { isAtAll: atAll },
      })
    } else if (type === MessageRobotType.FEISHU) {
      if (atAll) {
        await this.sendByRobotId(id, {
          msg_type: 'text',
          content: { text: '<at user_id="all">所有人</at>' },
        })
      }

      const feishuImageKey = await feishuUpload(
        imageInfo.file,
        imageExtraAuthentication?.feishuUploadAppId,
        imageExtraAuthentication?.feishuUploadAppSecret
      )

      return this.sendByRobotId(id, { msg_type: 'image', content: { image_key: feishuImageKey } })
    } else if (type === MessageRobotType.WXBIZ) {
      if (atAll) {
        await this.sendByRobotId(id, {
          msgtype: 'text',
          text: { content: '', mentioned_mobile_list: ['@all'] },
        })
      }

      return this.sendByRobotId(id, {
        msgtype: 'image',
        image: { base64: imageInfo.base64, md5: imageInfo.md5 },
      })
    } else {
      throw new Error('未知的机器人类型')
    }
  }

  /** 提供机器人 ID，发送原始 JSON 消息 */
  async sendByRobotId(id: string, messageBody: object) {
    const robotConfig = await this.prisma.messageRobot.findFirst({ where: { id } })
    const { type, accessToken, secret } = robotConfig

    return this.sendByFullConfig(type, messageBody, { accessToken, secret })
  }

  /** 提供机器人完整配置（类型、令牌、密钥）来发送原始 JSON 消息 */
  async sendByFullConfig(type: MessageRobotType, messageBody: object, authBody: IMessageRobotAuth) {
    const { accessToken, secret } = authBody

    if (type === MessageRobotType.DINGTALK) {
      const { sign, timestamp } = dingtalkRobotSign(secret)

      return axios
        .post(dintalkRobotUrl + accessToken + `&timestamp=${timestamp}&sign=${sign}`, messageBody)
        .then(res => res.data)
    } else if (type === MessageRobotType.FEISHU) {
      const { sign, timestamp } = feishuRobotSign(secret)

      return axios
        .post(feishuRobotUrl + accessToken, { timestamp: String(timestamp), sign, ...messageBody })
        .then(res => res.data)
    } else if (type === MessageRobotType.WXBIZ) {
      return axios.post(wxbizRobotUrl + accessToken, messageBody).then(res => res.data)
    } else {
      throw new Error('未知的机器人类型')
    }
  }
}
