import { Injectable } from '@nestjs/common'
import { Configuration, OpenAIApi } from 'openai'

@Injectable()
export class AiService {
  openai = new OpenAIApi(
    new Configuration({
      apiKey: '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',
      baseOptions:
        process.env.NODE_ENV === 'production'
          ? {}
          : { proxy: { protocol: 'http', host: '127.0.0.1', port: 7890 } },
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
      })
      .then(res => res.data)
      .then(res => res.choices?.[0].text)
  }

  async chat(prompt: string) {
    return this.openai
      .createChatCompletion({
        model: 'gpt-3.5-turbo-0301',
        messages: [{ role: 'user', content: prompt }],
      })
      .then(res => res.data)
      .then(res => res.choices?.[0].message?.content)
  }
}
