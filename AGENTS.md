# Agent Instructions
- **Never update this file**

## Project

- This repository contains the Janus Journey Backend for Frontend (BFF).
- The BFF is the public backend boundary consumed by the Janus Journey frontend.
- Stack:
  - Node.js
  - TypeScript
  - NestJS
  - REST
  - Better Auth JWT authentication

## Architecture

- The BFF is responsible for:
  - Authenticating requests from Janus clients.
  - Validating Better Auth JWTs.
  - Extracting the authenticated identity.
  - Validating and transforming transport data.
  - Delegating domain operations to the appropriate microservice.
  - Aggregating multiple microservice responses when required by a frontend use case.
- The BFF is not a domain service.
- Do not connect directly to domain databases.
- Do not implement persistence for User, Journey, Folder, Task, or Feature Flag.
- Do not implement domain business logic owned by a microservice.
- Do not duplicate logic from microservices.
- Do not create missing microservices or fake their behavior.
- If a requested feature requires a domain capability that does not exist yet, do not implement it inside the BFF as a shortcut.

## Authentication

- Better Auth is the authentication system used by Janus Journey.
- Authenticated requests use: `Authorization: Bearer <token>`.
- The BFF must validate the JWT signature, expiration, issuer, and audience.
- Expected audience: `janus-bff`.
- The authenticated user identity comes exclusively from the validated JWT `sub`.
- Never trust a user ID received through request params, query params, request bodies, or custom headers as proof of authentication.
- The BFF does not issue or refresh access tokens and does not manage Better Auth sessions.
- Authentication logic must be reusable.
- Do not duplicate JWT validation across controllers.

## NestJS Conventions

- Follow NestJS module and dependency injection conventions.
- Keep controllers thin.
- Prefer the following flow: `Controller → BFF/Application Service → Microservice Client`.
- Use DTOs and validation at external request boundaries.
- Do not introduce abstractions or architectural patterns before they are required.
- **NEVER** delete, replace, or overwrite existing files without explicit user authorization.
- **NEVER** revert or modify existing architectural decisions without explicit user authorization.
- **ALWAYS** preserve existing code and make only the changes strictly necessary for the requested task.
- **ALWAYS** inspect uncommitted changes before editing and preserve user modifications.

## Configuration

- Environment-specific configuration must use environment variables.
- Never hardcode credentials, secrets, service URLs, Better Auth issuer, or JWKS URLs.
- Keep `.env.example` synchronized with required environment variables.

## TypeScript and Dependencies

- Use strict TypeScript.
- Avoid `any`.
- Reuse existing dependencies before introducing new ones.
- Follow the repository's established dependency version conventions.
- Do not add dependencies for functionality already covered by the existing stack.

## AI Changelog

- After completing any task that modifies the project, append an entry to `AIChangelog.md`.
- Follow the format and rules defined inside `AIChangelog.md`.
- Add the newest entry at the top.
- Every completed change must have a unique sequential identifier using the format `#JANUS-BFF-XXXX`.
- Never reuse, modify, or reorder an existing change identifier.
- Determine the next identifier from the highest existing `JANUS-BFF` identifier in `AIChangelog.md`.
- Every entry must include a descriptive title and a `Work` summary describing the workflow used (e.g. `Plan / Build`) and the purpose of the task.
- Document the meaningful completed changes, including relevant UI, behavior, components, assets, configuration, architectural decisions, and implementation boundaries.
- Log completed work only; do not include unfinished plans, discussions, or unanswered prompts.
- Do not reduce substantial work to generic one-line summaries.
- Do not document trivial implementation details or unchanged behavior.

## Repository Conventions

- Follow the existing configuration for:
  - ESLint
  - Prettier
  - Husky
  - Commitlint
  - Conventional Commits
  - semantic-release
  - Tests
- Before considering a change complete, run the applicable lint, test, and build checks.

## Agent Behavior

- Inspect the existing implementation before modifying it.
- Read the relevant knowledge from the root-level `project/` directory before making architectural or domain decisions.
- Treat the root `project/` directory as the centralized source of project context, contracts, architecture, and domain knowledge shared by all Janus Journey repositories.
- Do not expect, create, or maintain repository-specific `project/` directories.
- Treat `project/` as project knowledge, not as implementation code.
- Reuse established patterns.
- Do not invent missing endpoints, microservices, domain contracts, or infrastructure.
- When a required architectural decision cannot be inferred safely from the existing implementation or the root `project/` knowledge, ask before implementing it.