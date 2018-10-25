import { Auth0DecodedToken } from "./types"

class Session {
  userId: string
  audience: string
  expiresAt: string
  scope: string

  constructor(decoded: Auth0DecodedToken) {
    const { sub, aud, exp, scope } = decoded

    this.userId = sub
    this.audience = aud
    this.expiresAt = new Date(exp * 1000).toISOString()
    this.scope = scope
  }
}

export default Session
