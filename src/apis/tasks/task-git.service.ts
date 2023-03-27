import { Injectable } from '@nestjs/common'

import { GitService } from '../ai-git-helper/git.service'

@Injectable()
export class TaskGitService {
  constructor(private readonly aiGitHelperService: GitService) {}
}
