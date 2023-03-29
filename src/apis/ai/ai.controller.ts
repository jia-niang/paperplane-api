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
    return this.aiService.completions(body.text).then(res => ({ answer: res?.trimStart() }))
  }

  @Post('/chat')
  @HttpCode(200)
  async chat(@Body() body: IAiCompletionsBody) {
    return this.aiService.chat(body.text).then(res => ({ answer: res?.trimStart() }))
  }

  @Post('/weekly')
  async weekly(@Body() body: { text: string; mode: weeklyModeType }) {
    return this.aiService.weekly(body.text, body.mode).then(res => ({ answer: res?.trimStart() }))
  }
}
