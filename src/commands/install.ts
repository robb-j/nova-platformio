import { createDebug, execute, mktemp, which } from '../lib.js'
import {
  showInstallRequest,
  showInstalled,
  showInstalling,
} from '../notifications.js'

const debug = createDebug('installer')

export async function runInstaller(
  workspace: Workspace,
  force: boolean,
): Promise<boolean> {
  try {
    const noInstaller = workspace.config.get(
      'robb-j.platformio.noInstaller',
      'boolean',
    )
    if (noInstaller && !force) {
      debug('User declined install')
      return false
    }

    const pythonPath = await which('python')
    if (!pythonPath) {
      debug('Python not installed')
      return false
    }

    const version = await execute(pythonPath, {
      args: ['--version'],
    })

    debug(version.stdout.trim()) // e.g. Python 3.11.4

    if (!force) {
      const result = await showInstallRequest()

      if (result === 'deny') {
        workspace.config.set('robb-j.platformio.noInstaller', true)
      }
    }

    const notif = showInstalling()

    const tmpdir = await mktemp({ directory: true })
    debug(`tmpdir=${tmpdir}`)

    const installerPath = nova.path.join(tmpdir, 'get-platformio.py')
    debug(`installer=${installerPath}`)

    nova.fs.copy(
      nova.path.join(nova.extension.path, 'get-platformio.py'),
      installerPath,
    )

    const install = new Process(pythonPath, {
      args: [installerPath],
      cwd: tmpdir,
    })
    install.onStdout((l) => debug('stdout ' + l))
    install.onStderr((l) => debug('stderr ' + l))

    const installStatus = await new Promise<number>((r) => {
      install.start()
      install.onDidExit((s) => r(s))
    })
    debug('status=', installStatus)

    debug('cleanup')
    nova.fs.rmdir(tmpdir)

    if (installStatus !== 0) {
      notif.dispose()
      console.error('Installer failed')
      return false
    }

    notif.dispose()
    showInstalled()

    debug('done')

    return true
  } catch (error) {
    console.error('Unknown error occurred')
    console.error(error)
    console.error((error as Error).stack)
    return false
  }
}

export async function installCommand(workspace: Workspace) {
  await runInstaller(workspace, true)
  // TODO: restart extension ...
}
