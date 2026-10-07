# AI Changelog

## 2026-10-07

### #JANUS-BFF-0007: Document Concrete User Collection Swagger Contract

**Work**: Build; Replaced the opaque User collection Swagger documentation with the concrete public BFF query and response contract.

- Documented required pagination, supported User filters, and approved sorting parameters directly from the validated query DTO.
- Added concrete User response, User filter, pagination, and collection response DTOs so `GET /users` exposes `User[]`, pagination metadata, and filter schemas without generic arbitrary-property payloads.
- Added Swagger E2E assertions for required query parameters, enum values, concrete response references, and removal of generic forwarding language.

## 2026-10-07

### #JANUS-BFF-0006: Standardize Bounded Collection Responses

**Work**: Plan / Build; Added mandatory bounded collection pagination and public `CollectionResponse` composition for Users, Journeys, Folders, and Tasks.

- Added shared pagination validation, centralized maximum page size normalization at `200`, strict downstream collection-result parsing, and public pagination metadata construction.
- Migrated collection routes to return `payload`, `pagination`, and resource-specific filters while preserving direct single-resource and mutation responses.
- Added downstream query forwarding, effective-size propagation, and tests covering the updated collection behavior without MongoDB `_id` exposure.

## 2026-10-07

### #JANUS-BFF-0005: Integrate Journey Domain CRUD

**Work**: Plan / Build; Added the authenticated BFF boundary for the existing Journey, Folder, and Task CRUD APIs exposed by `ms-journeys`.

- Added separate Journey, Folder, and Task BFF modules with resource-specific controllers, services, DTOs, validation, response contracts, and tests.
- Added shared configurable `ms-journeys` HTTP infrastructure with downstream response preservation, timeout/network error mapping, and domain `uid` forwarding without MongoDB `_id` or `x-authenticated-subject` coupling.
- Added Swagger grouping for `MS Users · Users`, `MS Journeys · Journeys`, `MS Journeys · Folders`, and `MS Journeys · Tasks`, plus environment configuration and E2E coverage.

## 2026-10-05

### #JANUS-BFF-0004: Add Authenticated User Provisioning Boundary

**Work**: Plan / Build; Connected the validated Better Auth identity to the User provisioning and lookup flow while preserving the BFF as the authenticated transport boundary.

- Added typed User provisioning input validation and injected the validated JWT `sub` as the downstream User `id` instead of accepting a client-supplied identity.
- Added `GET /users/me` to resolve the current User through `ms-users` and preserved downstream status propagation, including `404` for first-time provisioning and `409` for uniqueness conflicts.
- Added configurable frontend CORS origin handling and synchronized local BFF configuration with the `ms-users` port and frontend origin.
- Kept JWT validation, session management, and User persistence outside the BFF, delegating domain operations to `ms-users`.

## 2026-10-05

### #JANUS-BFF-0003: Document BFF Architecture and Usage

**Work**: Build; Replaced the NestJS starter README with repository-specific documentation for the authenticated BFF boundary, User delegation, configuration, development workflow, and source organization.

- Documented Better Auth JWT validation ownership and the BFF-to-`ms-users` request boundary.
- Documented the current authenticated User routes, environment variables, Swagger endpoints, and quality commands.
- Documented the BFF architectural boundaries that prevent domain persistence and JWT responsibilities from moving into the wrong service.

## 2026-10-05

### #JANUS-BFF-0002: Remove Vitest Dependencies

**Work**: Build; Removed the remaining Vitest-related dependencies from the BFF and confirmed the project dependency tree is Jest-only.

- Removed remaining Vitest, `@vitest`, and Vite path dependencies from the project dependency installation and lockfile.
- Confirmed the BFF dependency tree no longer contains Vitest-related packages.
- Preserved Jest as the project's test runner.

### #JANUS-BFF-0001: Replace Vitest with Jest

**Work**: Plan / Build; Migrated the BFF test tooling from Vitest to Jest while preserving the existing unit and e2e test coverage.

- Added ESM-compatible Jest and `ts-jest` configuration.
- Converted existing test mocks and assertions to Jest APIs.
- Removed Vitest/Vite dependencies and configuration.
- Removed the Mau deployment dependency and related deployment reference.
- Preserved existing application behavior and architecture.
