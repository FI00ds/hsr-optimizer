import {
  G_DRIVE_API_KEY,
  G_DRIVE_CLIENT_ID,
  G_DRIVE_CLIENT_SECRET,
} from 'lib/constants/constants'
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

async function __receiveGoogleAuthInfo(fragment: string) {
  // handle will always be non null as receiveGoogleAuthInfo is only called by the popup window
  handle!.close()
  handle = null
  const info = fragment
    .replace('#', '')
    .split('&')
    .map((x) => x.split('='))
  let codeDetails: Partial<CodeDetails> = {}
  const stateTuple = info.find((x) => x[0] === 'state')
  const isValidCode = stateTuple && stateTuple[1] === uuid
  if (isValidCode) {
    codeDetails.code = info.find((x) => x[0] === 'code')?.[1]
    codeDetails.scope = info.find((x) => x[0] === 'scope')?.[1]
  }
  console.log('info: ', info, 'auth details: ', codeDetails)

  // exchange access code for token and refresh token
  const data = await fetch(`https://oauth2.googleapis.com/token?
      client_secret=${G_DRIVE_CLIENT_SECRET}&
      client_id=${G_DRIVE_CLIENT_ID}&
      code=${codeDetails.code}&
      grant_type=authorization_code
    `)
    .then((res) => {
      if (res.ok) return res.json()
      // TODO: error handling
    })
    .then((json) => {
      console.log('final json: ', json)
    })
}

window.__receiveGoogleAuthInfo = __receiveGoogleAuthInfo

function googleEndpoint(uuid: string) {
  return `https://accounts.google.com/o/oauth2/v2/auth?
redirect_uri=https%3A//fi00ds.github.io/hsr-optimizer/loginWithGoogle/index.html&
prompt=consent&
response_type=code&
client_id=${G_DRIVE_CLIENT_ID}&
scope=https%3A//www.googleapis.com/auth/drive.appdata&
access_type=offline&
state=${uuid}
`
}

interface CodeDetails {
  code: string
  // will be https://www.googleapis.com/auth/drive.appdata
  scope: string
}
