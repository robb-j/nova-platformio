import { runInstaller } from './commands/install.js'
import { createDebug, debounce, execute, getPioPath, isFile } from './lib.js'
import { showSync } from './notifications.js'
import { Board, SystemInfo } from './types.js'

type InitializeStatus = 'success' | 'failed' | 'unknown-board'

const debug = createDebug('pio-language-server')

export class PlatformIO {
  static getInstance(workspacePath: string) {
    const binaryPath = getPioPath()

    return isFile(binaryPath) ? new PlatformIO(workspacePath, binaryPath) : null
  }

  static async setup(workspacePath: string): Promise<PlatformIO | null> {
    const pioPath = getPioPath()

    if (!isFile(pioPath)) {
      const success = await runInstaller(nova.workspace, false)
      if (!success) return null
    }

    // TODO: check for update?

    return new PlatformIO(workspacePath, pioPath)
  }

  triggerSync = debounce(300, () => this.syncWorkspace())

  constructor(
    public workspacePath: string,
    public binaryPath: string,
  ) {}

  async start() {
    debug('#start', this.binaryPath)

    // ...
  }

  dispose(): void {
    debug('#dispose')
  }

  async executeJson(args: string[]) {
    const result = await execute(this.binaryPath, { args })
    if (!result.ok) return
    return JSON.parse(result.stdout)
  }

  async getSystemInfo(): Promise<SystemInfo> {
    return this.executeJson(['system', 'info', '--json-output'])
  }

  async listBoards(): Promise<Board[]> {
    return this.executeJson(['boards', '--json-output'])
  }

  async syncWorkspace() {
    debug('#syncWorkspace')
    const notif = showSync()

    const process = new Process(this.binaryPath, {
      args: ['run', '--target', 'compiledb'],
      cwd: this.workspacePath,
    })
    process.onStdout((l) => debug('stdout ' + l))
    process.onStderr((l) => debug('stderr ' + l))

    await new Promise<number>((resolve) => {
      process.onDidExit((status) => resolve(status))
      process.start()
    })

    notif.dispose()

    // if (status === 0)
    // else
  }

  async initialize(boardId: string): Promise<InitializeStatus> {
    debug('#initialize board=' + boardId)

    const boards = await this.listBoards()
    const match = boards.find((b) => b.id === boardId)

    if (!match) return 'unknown-board'

    const process = new Process(this.binaryPath, {
      args: ['project', 'init', '--board', boardId],
      cwd: this.workspacePath,
    })
    process.onStdout((l) => debug('stdout ' + l))
    process.onStderr((l) => debug('stderr ' + l))

    const status = await new Promise<number>((resolve) => {
      process.onDidExit((status) => resolve(status))
      process.start()
    })

    if (status === 0) this.triggerSync()

    return status === 0 ? 'success' : 'failed'
  }

  getBoardsAction() {
    return new TaskProcessAction(this.binaryPath, {
      args: ['boards'],
    })
  }
  getSystemInfoAction() {
    return new TaskProcessAction(this.binaryPath, {
      args: ['system', 'info'],
    })
  }
}
