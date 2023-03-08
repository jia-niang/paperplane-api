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
}
