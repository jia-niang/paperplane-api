import { HttpException, Injectable } from '@nestjs/common'
import { OffworkNoticeMailSubscription, OffworkNoticeSetting } from '@prisma/client'
import { pick } from 'lodash'
import { PrismaService } from 'nestjs-prisma'

import { BusinessService } from '../business/business.service'
import { MessageRobotService } from '../message-robot/message-robot.service'

@Injectable()
export class DailyOffworkSubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly businessService: BusinessService,
    private readonly messageRobotService: MessageRobotService
  ) {}

  /** 添加 Offwork 提醒配置 */
  async addOffworkNoticeSetting(companyId: string, workplaceId: string, messageRobotId: string) {
    await this.businessService.ensureCompanyAndWorkplace(
      companyId,
      workplaceId,
      '请提供正确的公司和以及其所属的工作地点'
    )
    await this.messageRobotService.ensureCompanyAndMessageRobot(
      companyId,
      messageRobotId,
      '请提供正确的公司以及消息机器人'
    )

    const duplicate = await this.prisma.offworkNoticeSetting.findFirst({
      where: { companyId, workplaceId, messageRobotId },
    })
    if (duplicate) {
      throw new HttpException('存在完全相同的配置项，创建失败', 409)
    }

    return this.prisma.offworkNoticeSetting.create({
      data: { companyId, workplaceId, messageRobotId },
    })
  }

  /** 依公司和工作地列出 Offwork 提醒配置 */
  async listOffworkNoticeSetting(companyId: string, workplaceId: string) {
    const result = await this.prisma.offworkNoticeSetting.findMany({
      where: { companyId, workplaceId },
    })

    return result
  }

  /** 更新 Offwork 提醒配置 */
  async updateOffworkNoticeSetting(id: string, config: Pick<OffworkNoticeSetting, 'disabled'>) {
    return this.prisma.offworkNoticeSetting.update({
      where: { id },
      data: pick(config, ['disabled']),
    })
  }

  /** 删除 Offwork 提醒配置 */
  async deleteOffworkNoticeSetting(id: string) {
    return this.prisma.offworkNoticeSetting.delete({ where: { id } })
  }

  /** 添加邮件订阅 */
  async addOffworkMailSubscription(
    settingId: string,
    mailSubscription: OffworkNoticeMailSubscription
  ) {
    const duplicate = await this.prisma.offworkNoticeMailSubscription.findFirst({
      where: { offworkNoticeSettingId: settingId, mail: mailSubscription.mail },
    })
    if (duplicate) {
      throw new HttpException('此邮箱地址已订阅此消息源，请勿重复订阅', 409)
    }

    return this.prisma.offworkNoticeMailSubscription.create({
      data: {
        ...pick(mailSubscription, ['label', 'mail']),
        disabled: false,
        offworkNoticeSettingId: settingId,
      },
    })
  }

  /** 列出邮件订阅 */
  async listOffworkMailSubscription(settingId: string) {
    return this.prisma.offworkNoticeMailSubscription.findMany({
      where: { offworkNoticeSettingId: settingId },
    })
  }

  /** 更新邮件订阅 */
  async updateOffworkMailSubscription(recordId: string, newRecord: OffworkNoticeMailSubscription) {
    const record = await this.prisma.offworkNoticeMailSubscription.findFirstOrThrow({
      where: { id: recordId },
    })
    const duplicate = await this.prisma.offworkNoticeMailSubscription.findFirst({
      where: {
        id: { not: recordId },
        offworkNoticeSettingId: record.offworkNoticeSettingId,
        mail: newRecord.mail,
      },
    })
    if (duplicate) {
      throw new HttpException('此邮箱地址已订阅此消息源，请勿重复订阅', 409)
    }

    return this.prisma.offworkNoticeMailSubscription.update({
      where: { id: recordId },
      data: pick(newRecord, ['mail', 'disabled', 'label']),
    })
  }

  /** 删除邮件订阅 */
  async deleteOffworkMailSubscription(recordId: string) {
    return this.prisma.offworkNoticeMailSubscription.delete({ where: { id: recordId } })
  }
}
