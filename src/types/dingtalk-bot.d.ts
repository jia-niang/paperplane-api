/** 钉钉机器人的认证类别 */
type DingtalkBotTypeAuthType = 'keyword' | 'crypto' | 'ip'

/** 钉钉机器人基础信息 */
interface IDingtalkBotBase {
  /** 名称 */
  name: string
  /** 所属公司与群组标识 */
  scope: string
  /** 认证类别 */
  type: DingtalkBotTypeAuthType
  /** 描述 */
  desc?: string
  /** 头像 */
  avatar?: string
}

/** 关键词机器人 */
interface IKeywordDingtalkBot extends IDingtalkBotBase {
  type: 'keyword'
  /** 必须包含的关键词 */
  keywords: string[]
}

/** 加签机器人 */
interface ICryptoDingtalkBot extends IDingtalkBotBase {
  type: 'crypto'
  /** 令牌 */
  accessToken: string
  /** 密钥，以 SEC 开头 */
  secret: string
}

/** IP 机器人 */
interface IIpDingtalkBot extends IDingtalkBotBase {
  type: 'ip'
  /** 允许的 IP 地址列表 */
  ipList: string[]
}

/** 通用机器人配置 */
interface ICommonDingtalkBot extends Partial<ICryptoDingtalkBot> {
  type: DingtalkBotTypeAuthType
}
