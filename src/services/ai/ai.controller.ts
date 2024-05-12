import { Body, Controller, Get, Post } from '@nestjs/common'

import { Public } from '@/app/auth'

import { AiService } from './ai.service'

interface IAiCompletionsBody {
  text: string
  num?: number
}

@Controller('/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Public()
  @Get('/list')
  async listAllModels() {
    return this.aiService.listAllModels()
  }

  @Public()
  @Post('/completions')
  async completions(@Body() body: IAiCompletionsBody) {
    return this.aiService.completions(body.text).then(res => ({ answer: res?.trimStart() }))
  }

  @Public()
  @Post('/chat')
  async chat(@Body() body: IAiCompletionsBody) {
    return this.aiService.chat(body.text).then(res => ({ answer: res?.trimStart() }))
  }

  @Public()
  @Post('/multiple-chat')
  async multipleChat(@Body() body: IAiCompletionsBody) {
    if (typeof body.num !== 'number' || body.num < 1 || body.num > 3) {
      body.num = 1
    }

    return this.aiService
      .multipleChat(body.text, body.num)
      .then(res => res.map(answer => answer?.trimStart()))
  }

  @Public()
  @Post('/weekly')
  async weekly(@Body() body: { text: string }) {
    return this.aiService.weekly(body.text).then(res => ({ answer: res?.trimStart() }))
  }
}
