/** 企业微信通用响应 */
interface IWxBizCommonResponse {
  errcode: number
  errmsg: string
}

/** 企业微信通用成功响应 */
interface IWxBizSuccessCommonResponse extends IWxBizCommonResponse {
  errcode: 0
}

/** 企业微信/邮件/单条附件配置项 */
interface IWxBizMailAttachmentItem {
  file_name: string
  content: string
}

/** 企业微信/邮件/收件人配置项 */
interface IWxBizSendMailRecipientOption {
  /** 邮箱地址 */
  emails?: string[]
  /** 企业微信用户 ID */
  userids?: string[]
}

/** 企业微信/邮件/发送邮件配置 */
interface IWxBizSendMailOption {
  /** 收件人 */
  to: IWxBizSendMailRecipientOption
  /** 抄送 */
  cc?: IWxBizSendMailRecipientOption
  /** 密送 */
  bcc?: IWxBizSendMailRecipientOption
  /** 邮件主题 */
  subject: string
  /** 邮件正文 */
  content: string
  /** 附件列表 */
  attachment_list?: IWxBizMailAttachmentItem[]
  /** 是否开启模板转译功能，参考：https://developer.work.weixin.qq.com/document/path/97445 */
  enable_id_trans?: 1 | 0
}
