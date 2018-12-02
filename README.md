[![CircleCI](https://circleci.com/gh/litchi-io/auth0-node.svg?style=svg)](https://circleci.com/gh/litchi-io/auth0-node)
[![codecov](https://codecov.io/gh/litchi-io/auth0-node/branch/master/graph/badge.svg)](https://codecov.io/gh/litchi-io/auth0-node)
[![npm version](https://img.shields.io/npm/v/@usefultools/auth0-node.svg)](https://www.npmjs.com/package/@usefultools/auth0-node)
[![GuardRails badge](https://badges.production.guardrails.io/litchi-io/auth0-node.svg)](https://www.guardrails.io)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/litchi-io/auth0-node/blob/master/SECURITY.md)

# Auth0 Node

Simple Auth0 module for token verification.

## Prereqs & Install

* Node >=9.10.0
* npm >=6.1.0

Please note that the **TypeScript target is ES6**.

```sh
npm install @usefultools/auth0-node
```

## Usage

#### 1) Initialise the client 👾

```typescript
import { Auth0 } from "@usefultools/auth0-node" 

const auth0 = new Auth0("test.auth0.com")

```

#### 2) Verify, verify, verify 😎

```typescript
import { Auth0, Session } from "@usefultools/auth0-node" 
import { isNonEmptyString } from "@usefultools/utils"

const auth0 = new Auth0("test.auth0.com")

async function isAuthorised(req: Request, res: Response, next: Next): Promise<void> {
  const { headers } = req

  const bearerStr = "Bearer "
  const authHeader = headers[HeaderKey.Authorization]

  if (isNonEmptyString(authHeader) && authHeader.startsWith(bearerStr)) {
    const token = authHeader.substring(bearerStr.length, authHeader.length)

    try {
      const decoded = await auth0.verifyToken(token)

      Object.assign(req, { ctx: {
        ...req.ctx,
        session: decoded,
      }})

      next()
    } catch (err) {
      res.error(unauthorized(err))
    }
  } else {
    res.error(unauthorized("Invalid or missing token"))
  }
}

```

## Contributing

If you have comments, complaints, or ideas for improvements, feel free to open an issue or a pull request! See [Contributing guide](./CONTRIBUTING.md) for details about project setup, testing, etc.

## Author and license

This library was created by [@LITCHI.IO](https://github.com/litchi-io). Main author and maintainer is [Slavo Vojacek](https://github.com/slavovojacek).

Contributors: [Slavo Vojacek](https://github.com/slavovojacek)

`@usefultools/auth0-node` is available under the ISC license. See the [LICENSE file](./LICENSE.txt) for more info.
