import { getPioPath } from '../lib.js'
import { showInstalling } from '../notifications.js'
import { PlatformIO } from '../pio.js'

async function init(pio: PlatformIO, boardId: string) {
  const notif = showInstalling()

  const status = await pio.initialize(boardId)

  notif.dispose()

  if (status === 'unknown-board') {
    nova.workspace.showErrorMessage(
      'Unknown board entered, please check and try again',
    )
    return
  } else if (status === 'failed') {
    nova.workspace.showErrorMessage(
      'Initialize failed, check the extension console',
    )
    return
  }

  // Success..

  const ignoredPaths =
    nova.workspace.config.get('index.ignored_file_patterns', 'array') ?? []
  nova.workspace.config.set(
    'index.ignored_file_patterns',
    ignoredPaths.concat(['compile_commands.json']),
  )
}

export async function runInitialize(pio: PlatformIO) {
  nova.workspace.showInputPanel(
    'Enter your board ID, if you aren\'t sure you can use "List boards" Task to see whats available',
    { label: 'Board ID' },
    async (boardId) => {
      if (boardId) return init(pio, boardId)
    },
  )
}

export function initializeCommand(workspace: Workspace) {
  if (!workspace.path) {
    nova.workspace.showErrorMessage('Cannot initialize in temporary workspace')
    return
  }
  const pio = PlatformIO.getInstance(workspace.path)
  if (!pio) {
    nova.workspace.showErrorMessage('PlatformIO is not fully installed')
    return
  }

  return runInitialize(pio)
}
