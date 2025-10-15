import { G_DRIVE_CLIENT_ID } from 'lib/constants/constants'
import { Message } from 'lib/interactions/message'
import { BASE_PATH } from 'lib/state/db'

const GOOGLE_AUTH_ENDPOINT = `https://accounts.google.com/o/oauth2/v2/auth?
scope=https%3A//www.googleapis.com/auth/drive.appdata&
response_type=token&
client_id=${G_DRIVE_CLIENT_ID}&
redirect_uri=https%3A//fi00ds.github.io${BASE_PATH}/test.html
`

let handle: Window | null = null

export const SyncWithDriveSubmenu = () => {
  return (
    <>
      <button
        onClick={() => {
          const popupWidth = window.innerWidth / 4
          const popupHeight = window.innerHeight / 2
          const popupLeftOffset = (window.innerWidth - popupWidth) / 2
          const popupTopOffset = (window.innerHeight - popupHeight) / 2
          const popupFeatures = `popup,innerWidth=${popupWidth},innerHeight=${popupHeight},left=${popupLeftOffset},top=${popupTopOffset}`
          handle = window.open(GOOGLE_AUTH_ENDPOINT, 'test window', popupFeatures)
          if (!handle) Message.error('popup blocked')
        }}
      >
        sync with drive
      </button>
    </>
  )
}
