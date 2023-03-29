import { Injectable } from '@nestjs/common'
import { Configuration, OpenAIApi } from 'openai'

@Injectable()
export class AiService {
  openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPEN_AI_KEY,
      baseOptions: { proxy: JSON.parse(process.env.OPEN_AI_PROXY_CONFIG || 'null') },
    })
  )

  async listAllModels() {
    return this.openai.listModels().then(res => res.data)
  }

  async completions(prompt: string) {
    return this.openai
      .createCompletion({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 3000,
      })
      .then(res => res.data)
      .then(res => res.choices?.[0].text)
  }

  async chat(prompt: string) {
    return this.openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo-0301',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
      })
      .then(res => res.data)
      .then(res => res.choices?.[0].message?.content)
  }

  async weekly(text: string, mode: weeklyModeType) {
    let ask = ''

    if (mode === 'ymtd-fe') {
      ask = `“医脉同道” 是一个医疗行业的招聘网站，我是一个 “医脉同道” 的前端工程师，请帮我把以下的工作内容填充为一篇完整的周报，分为5个章节：目标和进度、详细进展、复盘与思考、需要的帮助和支持、后续行动项，用 markdown 输出：${text}`
    } else if (mode === 'career') {
      ask = `请帮我把以下的工作内容填充为一篇完整的周报，分为5个章节：目标和进度、详细进展、复盘与思考、需要的帮助和支持、后续行动项，其中“目标与进度”章节内容固定为“待补充”，“复盘与思考”、“需要的帮助和支持”章节的内容固定为“暂无”，用 markdown 输出：${text}`
    } else {
      ask = `请帮我把以下的工作内容填充为一篇完整的周报，用 markdown 格式以分点叙述的形式输出：${text}`
    }

    return this.openai
      .createCompletion({
        model: 'text-davinci-003',
        prompt: ask,
        max_tokens: 3000,
      })
      .then(res => res.data)
      .then(res => res.choices?.[0].text)
  }
}
