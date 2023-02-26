/** 钉钉消息的类型，可参阅 https://open.dingtalk.com/document/orgapp/custom-robot-access */
type DingtalkMessageType =
  /** 纯文本 */
  | 'text'
  /** 链接卡片 */
  | 'link'
  /** Markdown 富文本 */
  | 'markdown'
  /** 图文按钮卡片 */
  | 'actionCard'
  /** 公众号聚合消息型卡片 */
  | 'feedCard'

/** @ 人的消息配置结构 */
interface IDingtalkMessageAtConfigInfo {
  /** 是否 @ 全体 */
  isAtAll?: boolean
  /** 需要 @ 的人的手机号 */
  atMobiles?: string[]
  /** 需要 @ 的人的用户 ID */
  atUserIds?: string[]
}

/** @ 人的消息基础配置 */
interface IDingtalkMessageAtBase {
  at?: IDingtalkMessageAtConfigInfo
}

/** 基本钉钉消息 */
interface IDingtalkMessageBase {
  msgtype: DingtalkMessageType
}

/** 纯文本消息 */
interface IDingtalkTextMessage extends IDingtalkMessageBase, IDingtalkMessageAtBase {
  text: {
    /** 文本消息内容，注意 @ 人需包含在内 */
    content: string
  }
}

/** 链接卡片消息 */
interface IDingtalkLinkMessage extends IDingtalkMessageBase {
  link: {
    title: string
    text: string
    /** 点击跳转 url，配置参考 https://open.dingtalk.com/document/orgapp/message-link-description */
    messageUrl: string
    /** 封面图片 url */
    picUrl?: string
  }
}

/** Markdown 富文本消息 */
interface IDingtalkMarkdownMessage extends IDingtalkMessageBase, IDingtalkMessageAtBase {
  markdown: {
    /** 标题，只显示在对话列表左边 */
    title: string
    /** 文本消息内容，注意 @ 人需包含在内 */
    text: string
  }
}

/** 图文按钮卡片，有单按钮和多按钮两种模式 */
interface IDingtalkActionCardMessageBase extends IDingtalkMessageBase {
  actionCard: {
    title: string
    text: string

    /** 多个按钮时按钮配置，与 `singleTitle` 互斥 */
    btns?: {
      /** 按钮标题 */
      title: string
      /** 按钮的 url，配置参考 https://open.dingtalk.com/document/orgapp/message-link-description */
      actionURL: string
    }[]
    /** 多个按钮时按钮排列方式，0=竖向，1=横向 */
    btnOrientation?: '0' | '1'

    /** 单按钮时按钮的标题，设置此属性会使 `btns` 失效 */
    singleTitle?: string
    /** 单按钮时按钮的 url，配置参考 https://open.dingtalk.com/document/orgapp/message-link-description */
    singleURL?: string
  }
}

/** 公众号聚合消息型卡片 */
interface IDingtalkFeedCardMessage extends IDingtalkMessageBase {
  feedCard: {
    links: {
      /** 标题 */
      title: string
      /** 点击跳转 url，配置参考 https://open.dingtalk.com/document/orgapp/message-link-description */
      messageURL: string
      /** 封面图片 url */
      picURL: string
    }[]
  }
}
