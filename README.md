[![CircleCI](https://circleci.com/gh/litchi-io/auth0-node.svg?style=svg)](https://circleci.com/gh/litchi-io/auth0-node)
[![codecov](https://codecov.io/gh/litchi-io/auth0-node/branch/master/graph/badge.svg)](https://codecov.io/gh/litchi-io/auth0-node)
[![npm version](https://img.shields.io/npm/v/@usefultools/auth0-node.svg)](https://www.npmjs.com/package/@usefultools/auth0-node)
[![GuardRails badge](https://badges.production.guardrails.io/litchi-io/auth0-node.svg)](https://www.guardrails.io)
[![Security Responsible Disclosure](https://img.shields.io/badge/Security-Responsible%20Disclosure-yellow.svg)](https://github.com/litchi-io/auth0-node/blob/master/SECURITY.md)

# Auth0 Node

Simple Auth0 module for token verification

## Prereqs & Install

* Node >=9.10.0
* npm >=6.1.0

Please note that the **TypeScript target is ES6**.

```sh
npm install @usefultools/auth0-node
```

## Usage

1) Initialise the client

```typescript
import { Auth0 } from "auth0-node" 

const auth0 = new Auth0("test.auth0.com")

```

2) Verify, verify, verify 😎

```typescript
import { Auth0, Session } from "auth0-node" 

const auth0 = new Auth0("test.auth0.com")

async function setupSession(token: string): Promise<Session | null> {
  try {
    const decoded = await auth0.verifyToken(token)
    return new Session(decoded, token)
  } catch (err) {
    console.log(err)
    return null
  }
}

```

## Contributing

If you have comments, complaints, or ideas for improvements, feel free to open an issue or a pull request! See [Contributing guide](./CONTRIBUTING.md) for details about project setup, testing, etc.

If you make or are considering making an app using WatermelonDB, please let us know!

## Author and license

This library was created by [@LITCHI.IO](https://github.com/litchi-io). Main author and maintainer is [Slavo Vojacek](https://github.com/slavovojacek).

Contributors: [Slavo Vojacek](https://github.com/slavovojacek)

`@usefultools/auth0-node` is available under the ISC license. See the [LICENSE file](./LICENSE.txt) for more info.
