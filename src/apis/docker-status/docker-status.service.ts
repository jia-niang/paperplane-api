import { Injectable } from '@nestjs/common'
import axios from 'axios'

@Injectable()
export class DockerStatusService {
  getStatus = async function (containerName: string) {
    return axios
      .get(`http://localhost:2375/containers/${containerName}/json`)
      .then(res => res.data)
      .then(res => res?.State?.Status)
  }
}
