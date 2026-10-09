# AI Changelog

## 2026-10-09

### #JANUS-BFF-0015: Correct User Deletion Response Documentation

**Work**: Plan / Build; Verified the User deletion response through the BFF and `ms-users`, then aligned the BFF Swagger contract with the observed `204 No Content` behavior.

- Removed the misleading successful `200` response documenting a User body for `DELETE /users/{id}`.
- Preserved downstream status and body forwarding without changing deletion runtime behavior.
- Added coverage confirming the BFF returns `204` with no response body and forwards the authenticated identity.

## 2026-10-09

### #JANUS-BFF-0014: Restore Shared Pagination Parameters

**Work**: Plan / Build; Corrected the pagination alignment by reusing the existing shared `PaginationQueryDto` and restoring the established `page` and `size` parameters across BFF collection endpoints.

- Removed the User-specific pagination field and retained shared positive-integer validation.
- Preserved effective size normalization to 200 for Users, Journeys, Folders, and Tasks.
- Updated forwarding, Swagger assertions, and endpoint coverage without changing pagination defaults.

## 2026-10-09

### #JANUS-BFF-0013: Align User Validation Contracts

**Work**: Plan / Build; Aligned the BFF User boundary with the approved validation contract while preserving JWT-derived identity and independent `ms-users` validation.

- Added a typed nested `UpdateUserDto` validating editable `config.username` and nullable URL `config.avatarUrl` fields.
- Expanded User creation provider validation to `platform`, `google`, `github`, and `microsoft`.
- Added the User-specific `pageSize` query contract with positive-integer validation, effective normalization to 200, and no input maximum in Swagger.
- Preserved strict `true`/`false` handling for `isVerified` and added boundary and OpenAPI tests.

## 2026-10-08

### #JANUS-BFF-0012: Correct User Avatar URL Swagger Metadata

**Work**: Plan / Build; Corrected Users-module Swagger metadata so `config.avatarUrl` is documented as a nullable URL string with a valid example instead of an object.

- Updated User creation and response DTO decorators with explicit string type, URI format, and HTTPS example metadata.
- Updated the PATCH User OpenAPI schema with the same valid URL example and string type.
- Added E2E assertions covering the generated Swagger schemas without changing validation or runtime behavior.

## 2026-10-08

### #JANUS-BFF-0011: Document User Read and Update Responses

**Work**: Plan / Build; Replaced the generic successful response schemas for `GET /users/{id}` and `PATCH /users/{id}` with the existing verified `UserResponseDto` contract.

- Documented User identity, configuration, verification, metadata, timestamps, and authentication-provider details already returned by the BFF.
- Reused the existing nested response DTO structure instead of introducing duplicate response models.
- Preserved existing status codes and runtime behavior; POST and DELETE response documentation remain outside this point’s scope.
- Added Swagger assertions for the response reference and nested schemas without modifying `ms-users`.

## 2026-10-08

### #JANUS-BFF-0010: Document Editable User Update Payload

**Work**: Plan / Build; Replaced the opaque PATCH User request-body description with the verified editable configuration contract.

- Documented optional `config.username` and `config.avatarUrl` fields with their existing bounds and URL format.
- Documented that identity, authentication, persistence, and system-managed User fields are outside the editable request contract.
- Added Swagger E2E assertions for the update operation and request schema.
- Preserved runtime forwarding and intentionally left the separate generic User response schema unchanged.

## 2026-10-08

### #JANUS-BFF-0009: Document Paginated Collection Responses

**Work**: Plan / Build; Replaced incomplete paginated collection Swagger schemas for Journey, Folder, and Task endpoints with DTO-backed public response contracts.

- Documented `payload` arrays using the corresponding resource response DTOs.
- Documented `pagination` with `page`, `size`, `length`, `totalRecords`, and `totalPages`.
- Preserved the BFF-specific `{ payload, pagination, filters }` response shape and documented the currently empty filter object.
- Added OpenAPI assertions for collection response references, item schemas, and pagination metadata.
- Kept `GET /users` unchanged because its collection response was already documented correctly, and made no changes to `ms-journeys`.

## 2026-10-08

### #JANUS-BFF-0008: Document Task Pagination Parameters

**Work**: Plan / Build; Added explicit Swagger query-parameter documentation for the required `page` and `size` parameters on `GET /tasks` without changing runtime pagination behavior.

- Documented both parameters as required numeric query values with a minimum of `1`; runtime validation continues to require integers.
- Documented the effective maximum page size of `200` and the existing normalization behavior for larger values.
- Added an E2E OpenAPI assertion covering parameter names, location, required status, types, and bounds.
- Kept the corresponding `ms-journeys` implementation unchanged.

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
