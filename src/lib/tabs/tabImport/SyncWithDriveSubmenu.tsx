import { G_DRIVE_CLIENT_ID } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { BASE_PATH } from 'lib/state/db'

let handle: Window | null = null

let userToken = ''

let uuid = ''

export const SyncWithDriveSubmenu = () => {
  return (
    <>
      <button
        onClick={loginClicked}
      >
        sync with drive
      </button>
    </>
  )
}

function loginClicked() {
  const popupWidth = window.innerWidth / 4
  const popupHeight = window.innerHeight / 2
  const popupLeftOffset = (window.innerWidth - popupWidth) / 2
  const popupTopOffset = (window.innerHeight - popupHeight) / 2
  const popupFeatures = `popup,innerWidth=${popupWidth},innerHeight=${popupHeight},left=${popupLeftOffset},top=${popupTopOffset}`
  uuid = crypto.randomUUID()
  handle = window.open(googleEndpoint(uuid), 'google login window', popupFeatures)
  if (!handle) return Message.error('login popup blocked, please enable popups in order to login')
  handle.focus()
}

function receiveToken(fragment: string) {
  // handle must be non null as receiveToken is called by the popup window
  handle!.close()
  handle = null
  console.log(fragment.split('&').map((x) => x.split('=').join(': ')).join('\n'))
}

window.receiveGoogleAuthInfo = receiveToken

function googleEndpoint(uuid: string) {
  return `https://accounts.google.com/o/oauth2/v2/auth?
scope=https%3A//www.googleapis.com/auth/drive.appdata&
response_type=token&
client_id=${G_DRIVE_CLIENT_ID}&
redirect_uri=https%3A//fi00ds.github.io${BASE_PATH}/test.html&
state=${uuid}&
`
}
