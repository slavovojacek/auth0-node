export interface Auth0DecodedToken {
  sub: string
  aud: string
  exp: number
  scope: string
}
