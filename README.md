# Janus Journey BFF

The Janus Journey Backend for Frontend (BFF) is the authenticated backend
boundary consumed by Janus Journey clients.

It accepts client requests, validates Better Auth JWTs, extracts the
authenticated identity, and delegates domain operations to the appropriate
microservice. The BFF does not own domain persistence or domain business rules.

## BFF status

The current BFF includes:

- Bearer JWT authentication through Better Auth JWKS validation.
- JWT signature, expiration, issuer, and audience validation.
- A reusable authenticated identity guard based on the JWT `sub` claim.
- User CRUD routes delegated to `ms-users`.
- Journey, Folder, and Task CRUD routes delegated to `ms-journeys`.
- Forwarding of User collection query parameters.
- Downstream status, response body, and selected headers preservation.
- Swagger/OpenAPI documentation at `/docs` and `/docs-json`.
- Jest unit and e2e tests.

The current phase intentionally does **not** include:

- Direct database access.
- User persistence or User domain logic.
- Feature Flag operations.
- Token issuance, refresh, or Better Auth session management.

## Architecture and responsibility

```text
Janus clients
    │
    ▼
NestJS BFF :5000
    │
    ├── Better Auth JWT validation
    ├── Authenticated identity extraction
    └── REST client boundaries
            ├───────────────┬───────────────┐
            ▼               ▼               ▼
      ms-users :4001  ms-journeys :4002  (future services)
```

The BFF trusts only the validated JWT subject as the authenticated identity. It
forwards that identity to `ms-users` through the internal
`x-authenticated-subject` request header. `ms-users` does not validate JWTs.

### User routes

The BFF exposes the following authenticated routes:

| Method   | Route        | Responsibility                                      |
| -------- | ------------ | --------------------------------------------------- |
| `POST`   | `/users`     | Create a User through `ms-users`.                   |
| `GET`    | `/users`     | List Users and forward collection query parameters. |
| `GET`    | `/users/:id` | Retrieve a User through `ms-users`.                 |
| `PATCH`  | `/users/:id` | Update a User through `ms-users`.                   |
| `DELETE` | `/users/:id` | Delete a User through `ms-users`.                   |

The BFF intentionally keeps the request body contract open while `ms-users`
owns concrete User DTO validation and persistence rules.

### Journey, Folder, and Task routes

The BFF exposes authenticated CRUD routes delegated to `ms-journeys`:

| Method                   | Routes                                                                      | Responsibility                                           |
| ------------------------ | --------------------------------------------------------------------------- | -------------------------------------------------------- |
| `GET`, `POST`            | `/journeys/journeys`, `/journeys/folders`, `/journeys/tasks`                | List or create resources.                                |
| `GET`, `PATCH`, `DELETE` | `/journeys/journeys/:uid`, `/journeys/folders/:uid`, `/journeys/tasks/:uid` | Retrieve, partially update, or delete resources.         |
| `GET`                    | `/journeys/root`                                                            | Retrieve the authenticated User's direct root resources. |

Journey, Folder, and Task are separate BFF resources with resource-specific DTOs
and validation. Domain resources are identified by `uid`; MongoDB `_id` is not
part of the BFF contract.

## Technology stack

The BFF uses:

- **Node.js**
- **NestJS**
- **TypeScript**
- **REST**
- **Better Auth JWT validation through `jose`**
- **NestJS HTTP client** for downstream requests
- **Swagger/OpenAPI** for API documentation
- **Jest** and **Supertest** for tests
- **ESLint**, **Oxlint**, and **Prettier** for code quality

## Requirements

Before installing the project, make sure the following tools are available:

- Node.js 22 or a compatible current Node.js release.
- npm.
- A running Better Auth-compatible issuer exposing a JWKS endpoint.
- A running `ms-users` service for integrated User requests.
- A running `ms-journeys` service for integrated Journey, Folder, and Task requests.

## Installation

```bash
git clone <repository-url>
cd janus-journey-bff
npm install
```

Create a local environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Configure the environment values:

```dotenv
PORT=5000
BETTER_AUTH_ISSUER=http://localhost:3000
BETTER_AUTH_JWKS_URL=http://localhost:3000/api/auth/jwks
MS_USERS_BASE_URL=http://localhost:4001
MS_USERS_TIMEOUT_MS=5000
MS_JOURNEYS_BASE_URL=http://localhost:4002
MS_JOURNEYS_TIMEOUT_MS=5000
```

Do not commit `.env` or real credentials.

## Development

Start the BFF:

```bash
npm run start:dev
```

The BFF is available at:

- API: [http://localhost:5000](http://localhost:5000)
- Swagger UI: [http://localhost:5000/docs](http://localhost:5000/docs)
- OpenAPI JSON: [http://localhost:5000/docs-json](http://localhost:5000/docs-json)

Requests to authenticated routes must include:

```http
Authorization: Bearer <better-auth-jwt>
```

The JWT must use `janus-bff` as its audience and contain the authenticated user
identity in `sub`.

## Useful commands

```bash
# Run the development server
npm run start:dev

# Run ESLint
npm run lint

# Run Oxlint
npm run lint:oxlint

# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov

# Check formatting
npm run prettier:check

# Format the repository
npm run prettier:fix

# Create a production build
npm run build

# Start the production server after building
npm run start:prod
```

## Source structure

```text
src/
├── auth/       # JWT validation, guards, identity extraction, and auth types
├── config/     # Environment and Swagger configuration
└── users/      # User controller, application service, and ms-users client
```

The BFF follows the flow:

```text
Controller → BFF/Application Service → Microservice Client
```

## Contribution guidelines

When extending the BFF:

- Keep authentication at the BFF boundary.
- Use the validated JWT `sub` as the authenticated identity.
- Do not trust request bodies, route parameters, query parameters, or custom
  headers as proof of authentication.
- Keep domain persistence and domain business rules in the owning microservice.
- Use DTO validation for client-facing transport data.
- Prefer existing dependencies and established project conventions.

Meaningful completed changes are recorded in [`AIChangelog.md`](./AIChangelog.md).
