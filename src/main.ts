import { initializeCommand } from './commands/initialize.js'
import { installCommand } from './commands/install.js'
import {
  CommandKey,
  ConfigKey,
  createDebug,
  getPioPath,
  isFile,
} from './lib.js'
import { showCopied, showInstallFailed } from './notifications.js'
import { PlatformIO } from './pio.js'
import { BoardProvider, TargetProvider } from './sidebar.js'
import { PlatformIOTasks } from './tasks.js'

const debug = createDebug('main')

const syncSyntaxes = new Set(['ini', 'cpp', 'c', 'h'])

export async function activate() {
  debug('#activate')
  const workspacePath = nova.workspace.path
  if (!workspacePath) return

  const pio = await PlatformIO.setup(workspacePath)

  if (pio) {
    return startup(pio)
  }

  const noInstaller = nova.workspace.config.get(
    ConfigKey.noInstaller,
    'boolean',
  )
  if (!noInstaller) await showInstallFailed()

  // Prompt an install if the flag changes and it isn't installed
  nova.workspace.config.observe(ConfigKey.noInstaller, async (value) => {
    debug('observe', ConfigKey.noInstaller, value)
    if (value) return
    if (!isFile(getPioPath())) {
      const pio = await PlatformIO.setup(workspacePath)
      if (pio) startup(pio)
    }
    // TODO: else runUpgrader(nova.workspace, false)
  })
}

// Doesn't seem to be a type for this?
// https://docs.nova.app/extensions/commands/#custom-variables-in-when-clauses
function getContext(workspace = nova.workspace) {
  return (workspace as any).context as Configuration
}

function startup(pio: PlatformIO) {
  getContext().set('pioInstalled', true)
  getContext().remove('hasBoardSearch')

  nova.subscriptions.add(pio)

  nova.assistants.registerTaskAssistant(new PlatformIOTasks(pio))

  pio.triggerSync()

  // I think this only needs to happen for platformio.ini
  // which could be a simpler `fs.watch` -type thing
  nova.workspace.onDidAddTextEditor((editor) => {
    if (!syncSyntaxes.has(editor.document.syntax ?? '')) return
    editor.onDidSave(() => pio.triggerSync())
  })

  nova.commands.register(CommandKey.initialize, initializeCommand)
  nova.commands.register(CommandKey.install, installCommand)

  //
  // Boards sidebar
  //

  const boardProvider = new BoardProvider(pio)
  const boards = new TreeView('info.boards', { dataProvider: boardProvider })
  nova.subscriptions.add(boards)
  nova.commands.register(CommandKey.reloadBoards, () => {
    boards.reload()
  })
  nova.commands.register(CommandKey.copyBoard, () => {
    const [firstBoard] = boards.selection
    nova.clipboard.writeText(firstBoard.id)
    showCopied()
  })
  nova.commands.register('robb-j.platformio.resetBoards', async () => {
    boardProvider.search = null
    await boards.reload()
    getContext().remove('hasBoardSearch')
  })
  nova.commands.register('robb-j.platformio.searchBoards', async () => {
    const options = { value: boardProvider.search ?? undefined }
    const value = await new Promise<string | null>((resolve) =>
      nova.workspace.showInputPalette('Search boards', options, resolve),
    )
    if (!value) {
      nova.commands.invoke('robb-j.platformio.resetBoards')
      return
    }
    boardProvider.search = value
    await boards.reload()
    getContext().set('hasBoardSearch', true)
  })

  //
  // Targets sidebar
  //

  const targetProvider = new TargetProvider(pio)
  const targets = new TreeView('info.targets', { dataProvider: targetProvider })
  nova.subscriptions.add(targets)
  nova.commands.register(CommandKey.reloadTargets, () => {
    targets.reload()
  })
  nova.commands.register(CommandKey.runTarget, () => {
    const [firstTarget] = targets.selection
    console.log('run', firstTarget.name)
  })
}

export function deactivate() {
  debug('#deactivate')
}
