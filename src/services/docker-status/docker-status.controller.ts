import { Controller, Get, Param } from '@nestjs/common'

import { DockerStatusService } from './docker-status.service'

@Controller('/docker-status')
export class DockerStatusController {
  constructor(private readonly dockerStatusService: DockerStatusService) {}

  /** 列出所有 Docker 容器 */
  @Get('/')
  async listAllContainers() {
    return this.dockerStatusService.listAll()
  }

  /** 按容器名获取状态 */
  @Get('/:containerName')
  async getContainerStatus(@Param('containerName') containerName: string) {
    return this.dockerStatusService.getStatus(containerName)
  }
}
