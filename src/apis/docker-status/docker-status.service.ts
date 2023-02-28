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
  getStatus = async function (containerName: string): Promise<IDockerStatusResponse> {
    return axios
      .get(`http://${process.env.HOST || 'localhost'}:2375/containers/${containerName}/json`)
      .then(res => res.data)
      .then(res => res?.State)
  }

  listAll = async function (): Promise<any[]> {
    return axios
      .get(`http://${process.env.HOST || 'localhost'}:2375/containers/json`)
      .then(res => res.data)
  }
}
