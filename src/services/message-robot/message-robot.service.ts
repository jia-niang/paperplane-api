import { Injectable } from '@nestjs/common'
import { MessageRobot, MessageRobotType } from '@prisma/client'
import axios from 'axios'
import { PrismaService } from 'nestjs-prisma'

import { feishuUpload } from '@/utils/robotImageUpload'

import { UserService } from '../user/user.service'
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  async addUserRobot(userId: string, robot: MessageRobot) {
    robot.userId = userId
    robot.companyId = null

    return this.prisma.messageRobot.create({ data: robot })
  }

  async listUserRobots(userId: string) {
    return this.prisma.messageRobot.findMany({ where: { userId } })
  }

  async getUserRobotById(userId: string, id: string) {
    return this.prisma.messageRobot.findFirstOrThrow({ where: { id, userId } })
  }

  async updateUserRobot(userId: string, id: string, robot: MessageRobot) {
    await this.prisma.messageRobot.findFirstOrThrow({ where: { id, userId } })

    return this.prisma.messageRobot.update({ where: { id, userId }, data: robot })
  }

  async deleteUserRobot(userId: string, id: string) {
    await this.prisma.messageRobot.findFirstOrThrow({ where: { id, userId } })

    return this.prisma.messageRobot.delete({ where: { id, userId } })
  }

  async ensureUserAndMessageRobot(userId: string, robotId: string, throwError?: string | Error) {
    if (await this.userService.ensureAdminRole(userId)) {
      return true
    }

    const relation = await this.prisma.messageRobot.findFirst({
      where: { id: robotId, userId },
      include: { belongToUser: true },
    })

    if (relation) {
      return true
    } else if (throwError) {
      throw typeof throwError === 'string' ? new Error(throwError) : throwError
    }

    return false
  }

  async sendTextByUserRobotId(userId: string, id: string, text: string) {
    await this.prisma.messageRobot.findFirstOrThrow({ where: { id, userId } })

    return this.sendTextByRobotId(id, text)
  }

  async sendJSONByUserRobotId(userId: string, id: string, json: object) {
    const robotConfig = await this.prisma.messageRobot.findFirstOrThrow({ where: { id, userId } })

    return this.sendJSONByRobotConfig(robotConfig, json)
  }

  async addCompanyRobot(companyId: string, robot: MessageRobot) {
    robot.userId = null
    robot.companyId = companyId

    return
  }

  async listCompanyRobots(companyId: string) {
    return this.prisma.messageRobot.findMany({ where: { companyId } })
  }

  async getCompanyRobotById(companyId: string, id: string) {
    return this.prisma.messageRobot.findFirstOrThrow({ where: { id, companyId } })
  }

  async updateCompanyRobot(companyId: string, id: string, robot: MessageRobot) {
    await this.prisma.messageRobot.findFirstOrThrow({ where: { id, companyId } })

    return this.prisma.messageRobot.update({ where: { id, companyId }, data: robot })
  }

  async deleteCompanyRobot(companyId: string, id: string) {
    await this.prisma.messageRobot.findFirstOrThrow({ where: { id, companyId } })

    return this.prisma.messageRobot.delete({ where: { id, companyId } })
  }

  async ensureCompanyAndMessageRobot(
    companyId: string,
    robotId: string,
    throwError?: string | Error
  ) {
    const relation = await this.prisma.messageRobot.findFirst({
      where: { id: robotId, companyId },
    })

    if (relation) {
      return true
    } else if (throwError) {
      throw typeof throwError === 'string' ? new Error(throwError) : throwError
    }

    return false
  }

  async sendTextByCompanyRobotId(companyId: string, id: string, text: string) {
    await this.prisma.messageRobot.findFirstOrThrow({ where: { id, companyId } })

    return this.sendTextByRobotId(id, text)
  }

  async sendJSONByCompanyRobotId(companyId: string, id: string, json: object) {
    const robotConfig = await this.prisma.messageRobot.findFirstOrThrow({
      where: { id, companyId },
    })

    return this.sendJSONByRobotConfig(robotConfig, json)
  }

  /** 提供机器人 ID，发送纯文本 */
  async sendTextByRobotId(id: string, text: string) {
    const robotConfig = await this.prisma.messageRobot.findFirstOrThrow({ where: { id } })

    if (robotConfig.type === MessageRobotType.DINGTALK) {
      return this.sendJSONByRobotConfig(robotConfig, { msgtype: 'text', text: { content: text } })
    } else if (robotConfig.type === MessageRobotType.FEISHU) {
      return this.sendJSONByRobotConfig(robotConfig, { msg_type: 'text', content: { text } })
    } else if (robotConfig.type === MessageRobotType.WXBIZ) {
      return this.sendJSONByRobotConfig(robotConfig, { msgtype: 'text', text: { content: text } })
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
    const robotConfig = await this.prisma.messageRobot.findFirstOrThrow({ where: { id } })

    const { type, extraAuthentication } = robotConfig
    const imageExtraAuthentication = extraAuthentication as IMessageExtraAuthentication

    const { atAll, dingtalkTitle } = { atAll: false, dingtalkTitle: '', ...options }

    if (type === MessageRobotType.DINGTALK) {
      return this.sendJSONByRobotConfig(robotConfig, {
        msgtype: 'markdown',
        markdown: { title: dingtalkTitle, text: `![](${imageInfo.url})` },
        at: { isAtAll: atAll },
      })
    } else if (type === MessageRobotType.FEISHU) {
      if (atAll) {
        await this.sendJSONByRobotConfig(robotConfig, {
          msg_type: 'text',
          content: { text: '<at user_id="all">所有人</at>' },
        })
      }

      const feishuImageKey = await feishuUpload(
        imageInfo.file,
        imageExtraAuthentication?.feishuUploadAppId,
        imageExtraAuthentication?.feishuUploadAppSecret
      )

      return this.sendJSONByRobotConfig(robotConfig, {
        msg_type: 'image',
        content: { image_key: feishuImageKey },
      })
    } else if (type === MessageRobotType.WXBIZ) {
      if (atAll) {
        await this.sendJSONByRobotConfig(robotConfig, {
          msgtype: 'text',
          text: { content: '', mentioned_mobile_list: ['@all'] },
        })
      }

      return this.sendJSONByRobotConfig(robotConfig, {
        msgtype: 'image',
        image: { base64: imageInfo.base64, md5: imageInfo.md5 },
      })
    } else {
      throw new Error('未知的机器人类型')
    }
  }

  /** 提供机器人的 MessageRobot 格式配置，发送原始 JSON 消息 */
  async sendJSONByRobotConfig(robotConfig: MessageRobot, messageBody: object) {
    const { type, accessToken, secret } = robotConfig

    return this.sendJSONByFullConfig(type, messageBody, { accessToken, secret })
  }

  /** 提供机器人完整配置（类型、令牌、密钥）来发送原始 JSON 消息 */
  async sendJSONByFullConfig(
    type: MessageRobotType,
    messageBody: object,
    authBody: IMessageRobotAuth
  ) {
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
