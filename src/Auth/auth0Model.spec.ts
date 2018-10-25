import { readFileSync } from "fs"
import { sign } from "jsonwebtoken"
import * as moment from "moment"
import { resolve } from "path"
import Auth0 from "./auth0Model"
import Session from "./sessionModel"
import { Auth0DecodedToken } from "./types"

describe("Auth0 Model", () => {
  const self: {
    privateKey: Buffer
    publicKey: Buffer
    headers: any
  } = {
    privateKey: Buffer.alloc(0),
    publicKey: Buffer.alloc(0),
    headers: {},
  }

  beforeAll(() => {
    self.privateKey = readFileSync(resolve(__dirname, "./private_key.pem"))
    self.publicKey = readFileSync(resolve(__dirname, "./public_key.pem"))
  })

  beforeEach(() => {
    self.headers = { algorithm: "RS256", keyid: "abc-123" }
  })

  afterEach(() => {
    self.headers = null
  })

  describe("constructor", () => {
    it("correctly sets up the jwksClient", () => {
      const initMockJwksClient: any = jest.fn()
      // tslint:disable-next-line:no-unused-expression
      new Auth0("test.hostname.com", initMockJwksClient)
      expect(initMockJwksClient).toHaveBeenCalledWith({
        jwksUri: "https://test.hostname.com/.well-known/jwks.json",
      })
    })
  })

  describe("verifyToken", () => {
    it("rejects if getting a key fails because of a kid mismatch", async () => {
      const { privateKey, headers } = self
      const token = sign({ foo: "bar" }, privateKey, headers)

      const initMockJwksClient: any = () => ({
        getSigningKey: jest.fn((_kid, cb) => {
          cb(new Error("kid mismatch"))
        }),
      })

      const auth0 = new Auth0("test.hostname.com", initMockJwksClient)

      try {
        await auth0.verifyToken(token)
      } catch (err) {
        expect(err.name).toEqual("JsonWebTokenError")
        expect(err.message).toMatch(/kid mismatch/)
      }
    })

    it("rejects if getting a key fails because of invalid key", async () => {
      const { privateKey, headers } = self
      const token = sign({ foo: "bar" }, privateKey, headers)

      const initMockJwksClient: any = () => ({
        getSigningKey: jest.fn((_kid, cb) => {
          cb(null, {})
        }),
      })

      const auth0 = new Auth0("test.hostname.com", initMockJwksClient)

      try {
        await auth0.verifyToken(token)
      } catch (err) {
        expect(err.name).toEqual("JsonWebTokenError")
        expect(err.message).toMatch(
          /Neither publicKey nor rsaPublicKey found in signingKey/,
        )
      }
    })

    it("rejects if using an invalid publicKey key", async () => {
      const { privateKey, headers } = self
      const token = sign({ foo: "bar" }, privateKey, headers)

      const initMockJwksClient: any = () => ({
        getSigningKey: jest.fn((_kid, cb) => {
          cb(null, { publicKey: "invalid_key" })
        }),
      })

      const auth0 = new Auth0("test.hostname.com", initMockJwksClient)

      try {
        await auth0.verifyToken(token)
      } catch (err) {
        expect(err.name).toEqual("JsonWebTokenError")
      }
    })

    it("rejects if using an invalid rsaPublicKey key", async () => {
      const { privateKey, headers } = self
      const token = sign({ foo: "bar" }, privateKey, headers)

      const initMockJwksClient: any = () => ({
        getSigningKey: jest.fn((_kid, cb) => {
          cb(null, { rsaPublicKey: "invalid_key" })
        }),
      })

      const auth0 = new Auth0("test.hostname.com", initMockJwksClient)

      try {
        await auth0.verifyToken(token)
      } catch (err) {
        expect(err.name).toEqual("JsonWebTokenError")
      }
    })

    it("rejects for an invalid token shape", async () => {
      const { privateKey, publicKey, headers } = self
      const token = sign({ foo: "bar" }, privateKey, headers)

      const initMockJwksClient: any = () => ({
        getSigningKey: jest.fn((_kid, cb) => {
          cb(null, { publicKey })
        }),
      })

      const auth0 = new Auth0("test.hostname.com", initMockJwksClient)

      try {
        await auth0.verifyToken(token)
      } catch (err) {
        expect(err.name).toEqual("Error")
        expect(err.message).toEqual("Decoded entity is not a valid Auth0 token")
      }
    })

    it("resolves if using a valid publicKey key", async () => {
      const { privateKey, publicKey, headers } = self

      const payload: Auth0DecodedToken = {
        sub: "test|userId",
        aud: "test.hostname",
        exp: moment()
          .add(1, "year")
          .unix(),
        scope: "read:all",
      }

      const token = sign(payload, privateKey, headers)

      const initMockJwksClient: any = () => ({
        getSigningKey: jest.fn((_kid, cb) => {
          cb(null, { publicKey })
        }),
      })

      const auth0 = new Auth0("test.hostname.com", initMockJwksClient)

      const decoded = await auth0.verifyToken(token)
      const session = new Session(decoded, token)

      expect(session instanceof Session).toEqual(true)
      expect(session.accessToken).toEqual(token)
      expect(session.audience).toEqual(payload.aud)
      expect(session.expiresAt).toEqual(new Date(payload.exp * 1000).toISOString())
      expect(session.scope).toEqual(payload.scope)
      expect(session.userId).toEqual(payload.sub)
    })
  })
})
