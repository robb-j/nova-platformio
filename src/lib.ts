//
// Utility files to help out and make code more readable
//

export type ProcessParams = ConstructorParameters<typeof Process>
export type ProcessOutput = {
  ok: boolean
  stdout: string
  stderr: string
  status: number
}

/**
 * Run a non-interactive process and get the stdout, stderr & status in one go
 * @param {ProcessParams[0]} path The path to the binary to run
 * @param {ProcessParams[1]} options How to run the process
 * @returns A promise of a ProcessOutput
 */
export function execute(
  path: ProcessParams[0],
  options: ProcessParams[1],
): Promise<ProcessOutput> {
  return new Promise<ProcessOutput>((resolve) => {
    const process = new Process(path, options)

    // Copy all stdout into an array of lines
    let stdout = ''
    process.onStdout((line) => {
      stdout += line
    })

    // Copy all stderr into an array of lines
    let stderr = ''
    process.onStderr((line) => {
      stderr += line
    })

    // Resolve the promise once the process has exited,
    // with the stdout and stderr as single strings and the status code number
    process.onDidExit((status) =>
      resolve({ status, stderr, stdout, ok: status === 0 }),
    )

    // Start the process
    process.start()
  })
}

/**
 * Generate a method for namespaced debug-only logging,
 * inspired by https://github.com/visionmedia/debug.
 *
 * - prints messages under a namespace
 * - only outputs logs when nova.inDevMode()
 * - converts object arguments to json
 */
export function createDebug(namespace: string) {
  return (...args: any[]) => {
    if (!nova.inDevMode()) return

    const humanArgs = args.map((arg) =>
      typeof arg === 'object' ? JSON.stringify(arg) : arg,
    )
    console.info(`${namespace}:`, ...humanArgs)
  }
}

/** Find the full path of a binary */
export async function which(binary: string): Promise<string | null> {
  const { stdout, status } = await execute('/usr/bin/env', {
    args: ['which', binary],
  })
  return status === 0 ? stdout.trim() : null
}

export type MktempOptions = { directory?: boolean }

export async function mktemp({ directory = false }: MktempOptions = {}) {
  console.log('mktemp dir=', directory)

  const cmd = await which('mktemp')

  const result = await execute(cmd!, {
    args: directory ? ['-d'] : [],
  })

  return result.stdout.trim()
}

/**
 * Ask the workspace user to choose an option
 * and return a Promise for their response.
 */
export function askChoice(
  workspace: Workspace,
  placeholder: string | undefined,
  choices: string[],
) {
  return new Promise<string | null>((resolve) => {
    workspace.showChoicePalette(choices, { placeholder }, (choice) =>
      resolve(choice),
    )
  })
}

// "isBinary"? 
// https://github.com/panicinc/icarus/blob/7bfd7967f7414af3f6dab5f0b73d2531543f0f29/Icarus.novaextension/Scripts/main.js#L108
export function isFile(filename: string) {
  return nova.fs.stat(filename)?.isFile
}

export function getPioPath() {
  return nova.path.expanduser('~/.platformio/penv/bin/pio')
}

export enum ConfigKey {
  noInstaller = 'robb-j.platformio.noInstaller',
  debug = 'robb-j.platformio.debug',
}
export enum CommandKey {
  initialize = 'robb-j.platformio.initialize',
  install = 'robb-j.platformio.install',
  reloadBoards = 'robb-j.platformio.reloadBoards',
  copyBoard = 'robb-j.platformio.copyBoard',
  reloadTargets = 'robb-j.platformio.reloadTargets',
  runTarget = 'robb-j.platformio.runTarget',
}

export function debounce(ms: number, fn: () => void) {
  let timerId: number | null = null
  return () => {
    if (timerId) clearTimeout(timerId)
    setTimeout(() => fn(), ms)
  }
}

export function isDebug(workspace = nova.workspace): boolean {
  return workspace.config.get(ConfigKey.debug, 'boolean') ?? false
}
