import { Controller, Get, Param } from '@nestjs/common'

import { DockerStatusService } from './docker-status.service'

@Controller('/docker-status')
export class DockerStatusController {
  constructor(private readonly dockerStatusService: DockerStatusService) {}

  @Get('/:containerName')
  async getContainerStatus(@Param('containerName') containerName: string) {
    return this.dockerStatusService.getStatus(containerName)
  }
}
