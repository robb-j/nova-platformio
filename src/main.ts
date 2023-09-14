import { initializeCommand } from './commands/initialize.js'
import { installCommand } from './commands/install.js'
import {
  CommandKey,
  ConfigKey,
  createDebug,
  getPioPath,
  isFile,
} from './lib.js'
import { showInstallFailed } from './notifications.js'
import { PlatformIO } from './pio.js'
import { PlatformIOTasks } from './tasks.js'

const debug = createDebug('main')

const syncSyntaxes = new Set(['ini', 'cpp', 'c', 'h'])

export async function activate() {
  debug('#activate')
  const workspacePath = nova.workspace.path
  if (!workspacePath) return

  let pio = await PlatformIO.setup(workspacePath)

  if (!pio) {
    const noInstaller = nova.workspace.config.get(
      ConfigKey.noInstaller,
      'boolean',
    )
    if (!noInstaller) await showInstallFailed()
  } else {
    pio.start()
    nova.subscriptions.add(pio)
    nova.assistants.registerTaskAssistant(new PlatformIOTasks(pio))
  }

  // Prompt an install if the flag changes and it isn't installed
  nova.workspace.config.observe(ConfigKey.noInstaller, async (value) => {
    debug('observe', ConfigKey.noInstaller, value)
    if (value) return
    if (!isFile(getPioPath())) {
      pio = await PlatformIO.setup(workspacePath)
      pio?.triggerSync()
    }
    // TODO: else runUpgrader(nova.workspace, false)
  })

  pio?.triggerSync()

  nova.workspace.onDidAddTextEditor((editor) => {
    if (!pio || !syncSyntaxes.has(editor.document.syntax ?? '')) return
    editor.onDidSave(() => pio?.triggerSync())
  })

  nova.commands.register(CommandKey.initialize, initializeCommand)
  nova.commands.register(CommandKey.install, installCommand)
}

export function deactivate() {
  debug('#deactivate')
}
