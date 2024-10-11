import { Inject, Injectable } from '@nestjs/common'
import { ClientProxy, RmqContext } from '@nestjs/microservices'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class MessageQueueService {
  constructor(
    @Inject('PAPERPLANE_API_MQ')
    private readonly client: ClientProxy
  ) {}

  async testSend() {
    await lastValueFrom(this.client.send('test', 'hello.'))
      .then(res => {
        console.log('message queue send result: ', res)
      })
      .catch(err => {
        console.log('message queue send error: ', err)
      })
  }

  async testListen(data: string, context: RmqContext) {
    console.log('message queue receive: ', data)

    const originalMsg = context.getMessage()
    const channel = context.getChannelRef()
    channel.ack(originalMsg)

    return 'very good.'
  }
}
