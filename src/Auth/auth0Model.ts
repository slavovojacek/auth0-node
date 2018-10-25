import { isNonEmptyString, isObject, isPresent } from "@usefultools/utils"
import { verify, VerifyErrors } from "jsonwebtoken"
import * as jwksClient from "jwks-rsa"
import { Auth0DecodedToken } from "./types"

class Auth0 {
  static isValidDecodedToken = (decoded: any): decoded is Auth0DecodedToken => {
    return (
      isObject(decoded) &&
      "sub" in decoded &&
      "aud" in decoded &&
      "exp" in decoded &&
      "scope" in decoded
    )
  }

  private client: jwksClient.JwksClient

  constructor(hostname: string, initClient = jwksClient) {
    this.client = initClient({
      jwksUri: `https://${hostname}/.well-known/jwks.json`,
    })
  }

  verifyToken = async (token: string): Promise<Auth0DecodedToken> => {
    const { getKey } = this

    const verifyPromisified = (): Promise<Auth0DecodedToken> =>
      new Promise((resolve, reject) => {
        verify(
          token,
          getKey as any,
          (err: VerifyErrors, decoded: any): void => {
            if (isPresent(err)) {
              reject(err)
            } else {
              if (Auth0.isValidDecodedToken(decoded)) {
                resolve(decoded)
              } else {
                reject(new Error("Decoded entity is not a valid Auth0 token"))
              }
            }
          },
        )
      })

    return verifyPromisified()
  }

  private getKey = (
    header: { kid: string },
    cb: (err: Error | null, key: any) => void,
  ): void => {
    const { client } = this

    client.getSigningKey(
      header.kid,
      (err, key): void => {
        if (isPresent(err)) {
          cb(err, "")
        } else {
          const signingKey = key.publicKey || key.rsaPublicKey

          if (isNonEmptyString(signingKey) || Buffer.isBuffer(signingKey)) {
            cb(null, signingKey)
          } else {
            cb(
              new ReferenceError(
                "Neither publicKey nor rsaPublicKey found in signingKey",
              ),
              "",
            )
          }
        }
      },
    )
  }
}

export default Auth0
