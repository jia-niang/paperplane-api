import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common'

import { AiService } from './ai.service'

interface IAiCompletionsBody {
  text: string
}

@Controller('/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('/list')
  async listAllModels() {
    return this.aiService.listAllModels()
  }

  @Post('/completions')
  @HttpCode(200)
  async completions(@Body() body: IAiCompletionsBody) {
    const { text } = body

    return this.aiService.completions(text).then(res => ({ answer: res?.trimStart() }))
  }

  @Post('/chat')
  @HttpCode(200)
  async chat(@Body() body: IAiCompletionsBody) {
    const { text } = body

    return this.aiService.chat(text).then(res => ({ answer: res?.trimStart() }))
  }
}
