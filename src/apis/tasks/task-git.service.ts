import { Injectable } from '@nestjs/common'

import { GitService } from '../git/git.service'

@Injectable()
export class TaskGitService {
  constructor(private readonly aiGitHelperService: GitService) {}
}
