export async function showInstallFailed() {
  const notif = new NotificationRequest()
  notif.title = nova.localize('install-failed-title')
  notif.body = nova.localize('install-failed-body')
  notif.actions = [nova.localize('ok'), nova.localize('open-readme')]

  const response = await nova.notifications.add(notif)
  if (response.actionIdx === 1) {
    nova.openURL('https://github.com/robb-j/nova-platformio#readme')
  }
}

export async function showInstalled() {
  const notif = new NotificationRequest('platformio.installed')
  notif.title = nova.localize('installed-title')
  notif.body = nova.localize('installed-body')
  notif.actions = [nova.localize('ok')]

  await nova.notifications.add(notif)
}

export async function showInstallRequest() {
  const notif = new NotificationRequest('platformio.requestInstall')
  notif.title = nova.localize('install-title')
  notif.body = nova.localize('install-body')
  notif.actions = [
    nova.localize('install-confirm'),
    nova.localize('install-deny'),
  ]

  const response = await nova.notifications.add(notif)

  return response.actionIdx === 0 ? 'confirm' : 'deny'
}

function fancyNotif(
  notif: NotificationRequest,
  waitTime: number,
  showTime: number,
): Disposable {
  let startTime = Date.now() + waitTime

  let timerId: number | null = setTimeout(() => {
    console.log('show installing')
    nova.notifications.add(notif)
    timerId = null
  }, waitTime)

  return {
    dispose() {
      if (timerId) {
        clearTimeout(timerId)
      } else {
        setTimeout(
          () => {
            console.log('cancel')
            nova.notifications.cancel(notif.identifier)
          },
          Date.now() - startTime + showTime,
        )
      }
    },
  }
}

export function showInstalling(): Disposable {
  const identifier = 'platformio.installing'

  const notif = new NotificationRequest(identifier)
  notif.title = nova.localize('installing-title')
  notif.body = nova.localize('installing-body')

  // let startTime = Date.now() + INSTALL_WAIT_MS
  // let timerId: number | null = setTimeout(() => {
  //   console.log('show installing')
  //   nova.notifications.add(notif)
  //   timerId = null
  // }, INSTALL_WAIT_MS)

  return fancyNotif(notif, 3_000, 5_000)
}

export function showSync(): Disposable {
  const identifier = 'platformio.sync'

  const notif = new NotificationRequest(identifier)
  notif.title = nova.localize('sync-title')
  notif.body = nova.localize('sync-body')
  // nova.notifications.add(notif)

  // TODO: could ensure they stay for a min of x seconds
  // or ONLY show after a min of x seconds

  return fancyNotif(notif, 3_000, 5_000)

  // return {
  //   dispose() {
  //     nova.notifications.cancel(identifier)
  //   },
  // }
}

export function showInitialized() {
  const identifier = 'platformio.initialized'

  const notif = new NotificationRequest(identifier)
  notif.title = nova.localize('initialized-title')
  notif.body = nova.localize('initialized-body')
  return nova.notifications.add(notif)
}
