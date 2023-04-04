import { Injectable } from '@nestjs/common'
import axios from 'axios'

export interface IDockerStatusResponse {
  Status: string
  Running: boolean
  Paused: boolean
  Restarting: boolean
  OOMKilled: boolean
  Dead: boolean
  ExitCode: number
  Error: string
  StartedAt: string
  FinishedAt: string
}

@Injectable()
export class DockerStatusService {
  private dockerApiClient = axios.create({ baseURL: process.env.DOCKER_API_HOST })

  getStatus = async function (containerName: string): Promise<IDockerStatusResponse> {
    return this.dockerApiClient
      .get(`/containers/${containerName}/json`)
      .then(res => res.data)
      .then(res => res?.State)
  }

  listAll = async function (): Promise<any[]> {
    return this.dockerApiClient.get(`/containers/json`).then(res => res.data)
  }
}
