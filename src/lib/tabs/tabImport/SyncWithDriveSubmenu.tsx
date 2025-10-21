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

function __receiveGoogleAuthInfo(fragment: string) {
  // handle will always be non null as receiveGoogleAuthInfo is only called by the popup window
  handle!.close()
  handle = null
  const info = fragment
    .replace('#', '')
    .split('&')
    .map((x) => x.split('='))
  let authDetails: Partial<AuthDetails> = {}
  const stateTuple = info.find((x) => x[0] === 'state')
  const isValidAuth = stateTuple && stateTuple[1] === uuid
  if (isValidAuth) {
    authDetails.access_token = info.find((x) => x[0] === 'access_token')?.[1]
    authDetails.token_type = info.find((x) => x[0] === 'token_type')?.[1]
    authDetails.scope = info.find((x) => x[0] === 'scope')?.[1]
    authDetails.expires_in = Number(info.find((x) => x[0] === 'expires_in')?.[1])
  }
  console.log('info: ', info, 'auth details: ', authDetails)
}

window.__receiveGoogleAuthInfo = __receiveGoogleAuthInfo

function googleEndpoint(uuid: string) {
  return `https://accounts.google.com/o/oauth2/v2/auth?
scope=https%3A//www.googleapis.com/auth/drive.appdata&
response_type=token&
client_id=${G_DRIVE_CLIENT_ID}&
redirect_uri=https%3A//fi00ds.github.io${BASE_PATH}/loginWithGoogle/index.html&
state=${uuid}&
&access_type=offline
`
}

interface AuthDetails {
  access_token: string
  // will always be 'Bearer'
  token_type: string
  // will be https://www.googleapis.com/auth/drive.appdata
  scope: string
  // lasts 1 hour
  expires_in: number
}
