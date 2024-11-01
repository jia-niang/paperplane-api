import { Injectable } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { pick } from 'lodash'

import { RedisService } from '../redis/redis.service'

const WXBIZ_REDIS_PREFIX = 'wxbiz:'

@Injectable()
export class WxBizService {
  client: AxiosInstance

  constructor(private readonly redis: RedisService) {
    this.client = axios.create()

    this.client.interceptors.request.use(async config => {
      const access_token = await this.useAccessToken()
      config.params = { access_token, ...config.params }

      return config
    })

    this.client.interceptors.response.use(response => {
      const { errcode, errmsg } = response.data
      if (errcode !== 0) {
        return Promise.reject(new Error(errmsg))
      }

      return response
    })
  }

  private async useAccessToken() {
    const accessToken = await this.redis.get(WXBIZ_REDIS_PREFIX + 'access_token')
    if (accessToken) {
      return accessToken
    }

    const { access_token, expires_in } = await axios
      .get(
        `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${process.env.WXBIZ_CROP_ID}&corpsecret=${process.env.WXBIZ_APP_SECRET}`
      )
      .then(response => response.data)
      .then(res => {
        if (res.errcode !== 0) {
          throw new Error(res.errmsg)
        }

        return res
      })
    await this.redis.set(WXBIZ_REDIS_PREFIX + 'access_token', access_token, 'EX', expires_in)

    return access_token
  }

  async sendMail(options: IWxBizSendMailOption) {
    const result = await this.client
      .post(`https://qyapi.weixin.qq.com/cgi-bin/exmail/app/compose_send`, options)
      .then(res => res.data)

    return result
  }

  async getAppMailAddress() {
    return this.client
      .get(`https://qyapi.weixin.qq.com/cgi-bin/exmail/app/get_email_alias`)
      .then(res => res.data)
  }

  async setAppMailAddress(newAddress: string) {
    return this.client
      .post(`https://qyapi.weixin.qq.com/cgi-bin/exmail/app/update_email_alias`, {
        new_email: newAddress,
      })
      .then(res => res.data)
  }
}
