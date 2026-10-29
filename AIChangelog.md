## 2026-10-29

### #JANUS-BFF-0035: Synchronize Resource Activity Response Contracts

**Work**: Plan / Build / Validate; Added the server-controlled `lastActivityAt` timestamp to Journey, Folder, and Task BFF response DTOs and their generated Swagger schemas without changing request contracts.

- Nested and collection responses inherit the field through the existing response DTO references.
- POST and PATCH request DTOs remain unchanged, so clients cannot submit or edit the field.

### #JANUS-BFF-0034: Preserve Folder Progress In Resource Responses

**Work**: Validate; Confirmed the BFF resource envelope preserves the per-Folder progress returned by ms-journeys without recalculating or reshaping domain data.

## 2026-10-27

### #JANUS-BFF-0033: Standardize Journey Swagger Image Examples

**Work**: Document / Validate; Standardized the Journey request and response Swagger examples to show `/janus_journey_backgrounds/mount-sunrise.png` across all Journey endpoints.

## 2026-10-27

### #JANUS-BFF-0032: Require Journey Background Image Paths on Creation

**Work**: Correct / Validate; Made `imgUrl` required on single and composed Journey creation request DTOs and documented it as a required Swagger property.

## 2026-10-27

### #JANUS-BFF-0031: Forward Journey Background Image Paths

**Work**: Plan / Build / Validate; Added optional string `imgUrl` to Journey request and response DTOs and forwarded it through single-resource and composed Journey creation contracts.

- Swagger documents the new request and response property while preserving existing response normalization and downstream status handling.

## 2026-10-22

### #JANUS-BFF-0030: Add Bulk Folder and Task Deletion

**Work**: Plan / Build / Validate; Added authenticated BFF orchestration for bulk Folder and Task deletion through the corresponding `ms-journeys` endpoints.

- Added validated `{ ids }` request DTOs with non-empty, unique string arrays.
- Added `DELETE /journeys/folders/bulk` and `DELETE /journeys/tasks/bulk`, returning downstream `204 No Content` responses without a body.
- Preserved downstream status/error propagation and kept ownership, transactions, cascading, and persistence logic in `ms-journeys`.
- Added client, service, validation, endpoint, and delegation coverage without changing single-resource deletion routes.

## 2026-10-19

### #JANUS-BFF-0029: Standardize Completed Task State

**Work**: Fix / Task Contracts; Updated the BFF Task state contract and validation to accept only `completed` for completed Tasks.

- Updated the shared BFF Task state list used by create, update, bulk, composition, and response DTOs.
- Updated end-to-end request coverage without changing authentication, routing, or downstream behavior.

## 2026-10-15

### #JANUS-BFF-0028: Standardize Folder and Task Creation Responses

**Work**: Refactor / API Contracts; Standardized the public BFF creation responses for Folder and Task resources without changing request validation, downstream creation behavior, or Journey composition internals.

- Added explicit single-resource and array-resource payload response DTOs for Folder and Task creation.
- Wrapped successful `POST /journeys/folders` and `POST /journeys/tasks` responses as `{ payload: resource }`.
- Converted successful bulk creation correlation responses from `{ items: [{ resource }] }` to `{ payload: [resource] }` for `/journeys/folders/bulk` and `/journeys/tasks/bulk`.
- Preserved upstream error responses, status codes, authentication, validation, and raw service responses used by Journey composition.
- Added E2E coverage for all four response bodies and their generated Swagger schemas.

## 2026-10-09

### #JANUS-BFF-0022: Expose Complete Resource Retrieval

**Work**: Plan / Build; Added the authenticated BFF resource retrieval route backed by the new ms-journeys complete-resource endpoint while preserving the BFF payload response convention.

- Added `GET /journeys/resources/:resourceType/:resourceId` for Journey, Folder, and Task retrieval.
- Preserved nested Journey Folders and Tasks, direct Journey Tasks, and Folder Tasks from the microservice response.
- Added downstream client forwarding, success/error transformation, parameter validation, Swagger variants, and route coverage.

## 2026-10-09

### #JANUS-BFF-0021: Normalize Root Resources To Payload

**Work**: Plan / Build; Adapted the `GET /journeys/root` BFF response from the microservice `items` property to the BFF-standard `payload` property.

- Preserved the root resource arrays and `registers` value.
- Preserved non-success upstream responses without reshaping their error bodies.
- Added service and E2E coverage for the response normalization.

### #JANUS-BFF-0020: Nest Journeys Domain Routes Under Prefix

**Work**: Plan / Build; Updated the BFF route map so every Journeys-domain module is exposed beneath the `/journeys` domain prefix.

- Moved Journey, Folder, and Task public routes to `/journeys/journeys`, `/journeys/folders`, and `/journeys/tasks`.
- Preserved the authenticated root route at `/journeys/root`.
- Updated README route documentation and E2E/Swagger path assertions.

### #JANUS-BFF-0019: Restore Journey Route Prefix Flow

**Work**: Plan / Build; Restored the dedicated `journeys.routes.ts` prefix flow for the authenticated root-resource controller without changing the existing Journey, Folder, or Task public routes.

- Scoped the `/journeys` RouterModule prefix to the User Root module only.
- Kept resource controllers outside the nested prefix to prevent `/journeys/journeys` regressions.

### #JANUS-BFF-0018: Add Authenticated Journey Root Resources

**Work**: Plan / Build; Added the authenticated BFF `GET /journeys/root` boundary that forwards the validated JWT subject to the `ms-journeys` User root-resource endpoint.

- Added one upstream root-resource request through `MsJourneysClient` without pagination or filtering.
- Preserved the upstream `items` arrays, ordering, and `registers` value without recalculation.
- Added nested Swagger response DTOs and coverage for authentication, routing, identity forwarding, empty results, and upstream responses.

### #JANUS-BFF-0017: Align Journey Swagger Resource Schemas

**Work**: Plan / Build; Aligned BFF Journey, Folder, and Task request and response DTOs with the approved nested parent contract used by `ms-journeys`.

- Replaced `parentUid` with validated `parent.uid` and `parent.type` structures.
- Corrected description examples, nullable string metadata, and numeric `orderIndex` examples for request and response schemas.
- Added OpenAPI coverage for POST, GET, GET-by-UID, and PATCH operations across all three resources without changing domain business logic.

# Point 15 - Update Swagger Request and Response Schemas

## Context

The Janus Journey BFF contains outdated Swagger schemas for Journeys, Folders, and Tasks.

The previous `parentUid` property was replaced by the approved parent structure:

```typescript
parent: {
  uid: string
  type: 'user' | 'journey' | 'folder'
}
```

However, Swagger UI still displays obsolete properties and incorrect example values.

## Mandatory Preflight

Before implementing changes:

1. Read and follow `AGENTS.md` and the relevant documentation in `/proyect/debt`.
2. Inspect the existing BFF controllers, DTOs, Swagger decorators, and response schemas.
3. Inspect the corresponding implementations in `ms-journeys` to verify the actual contracts.
4. Reuse existing DTOs, schemas, and conventions instead of introducing unnecessary abstractions.
5. Follow the approved domain contracts and avoid reproducing obsolete structures.
6. If BFF and microservice contracts differ, investigate the discrepancy before making changes. Request clarification when the expected behavior is unclear.

## Objective

Correct the Swagger UI request and response schemas for Journeys, Folders, and Tasks so they accurately represent the current domain contracts.

## Scope

Review the following operations for all three resources:

| Resource | Operations                  |
| -------- | --------------------------- |
| Journeys | GET, GET BY ID, POST, PATCH |
| Folders  | GET, GET BY ID, POST, PATCH |
| Tasks    | GET, GET BY ID, POST, PATCH |

### 1. Request Body Example Schemas

Replace obsolete `parentUid` references with the current nested `parent` structure.

Ensure that:

- `parent.uid` is documented correctly.
- `parent.type` reflects the allowed parent types for each resource.
- Required and optional properties match the actual request DTOs.
- POST and PATCH examples reflect their respective contracts.
- GET operations are not incorrectly assigned request bodies.

### 2. Response Body Example Schemas

Correct the response schemas for all applicable operations.

Specifically:

- Replace `parentUid` with `parent: { uid, type }`.
- Replace incorrect `orderIndex: object` examples with representative numeric values, such as `100`.
- Replace incorrect `description: object` examples with meaningful, realistic descriptions appropriate to each resource.
- Ensure that field types, nullability, nested structures, and response formats match the actual microservice contracts.
- Preserve pagination wrappers for collection responses where applicable.
- Ensure that response examples reflect the actual data returned by each endpoint.

### 3. Swagger Consistency

Verify that the generated OpenAPI schemas and Swagger UI examples accurately reflect the DTO definitions.

Prefer correcting the underlying DTO metadata and Swagger decorators rather than introducing hardcoded examples that conceal incorrect schemas.

## Restrictions

- **Modify the BFF only.**
- `ms-journeys` may be inspected but must not be modified.
- Do not change business logic, persistence, validation behavior, or endpoint functionality.
- Do not introduce new domain properties.
- Do not reintroduce `parentUid`.
- Do not invent response structures or field types.
- Do not create duplicate DTOs when existing ones can be reused.
- Do not modify unrelated endpoints.
-

## 2026-10-14

### #JANUS-BFF-0023: Resolve Bulk Resource Parents From JWT Identity

**Work**: Plan / Build; Added authenticated BFF parent resolution for direct-array bulk Folder and Task creation requests.

- Added `POST /journeys/folders/bulk` and `POST /journeys/tasks/bulk` routes that validate each array item before forwarding.
- Derived omitted parents from the validated JWT `sub` as `{ uid, type: 'user' }` and rejected explicit client-provided User parents with HTTP 400.
- Preserved permitted Journey and Folder parents, optional `clientId`, metadata, ordering, and resource fields while forwarding `{ items: resolvedItems }` to ms-journeys.
- Added Swagger metadata and service coverage for per-item resolution, explicit User rejection, and prevention of downstream calls on invalid requests.

## 2026-10-14

### #JANUS-BFF-0024: Centralize Creation Parent Resolution

**Work**: Plan / Build; Fixed authenticated User parent resolution across the approved Journey, Folder, and Task creation endpoints without changing downstream services or unrelated routes.

- Added one reusable parent-resolution function for omitted, empty, partial, explicit User, and valid non-User parent inputs.
- Applied the function to individual Journey, Folder, and Task creation plus Folder and Task bulk creation, resolving every bulk item before forwarding.
- Preserved valid non-User parents, optional `clientId`, existing resource fields, and `{ items: resolvedItems }` bulk forwarding.
- Updated only the approved creation Swagger documentation and added focused utility, service, and client coverage.

## 2026-10-14

### #JANUS-BFF-0025: Compose Journey Resources

**Work**: Plan / Build; Added the authenticated Journey composition endpoint that orchestrates existing Journey, Folder bulk, and Task bulk creation services.

- Added `POST /journeys/journeys/compose` with nested Folder and Task validation, required unique Folder `clientId` values, and Swagger documentation.
- Created the Journey first, mapped returned Folder UIDs by `clientId`, and submitted one combined Task bulk request for root and nested Folder Tasks.
- Reused existing JWT parent resolution and resource service methods, returning only the original Journey response after all requested operations succeed.
- Preserved existing endpoint contracts and avoided changes to microservices, frontend code, resource schemas, and rollback behavior.

## 2026-10-14

### #JANUS-BFF-0026: Compensate Failed Compose Journey Creation

**Work**: Plan / Build; Added failure compensation to the existing Compose Journey orchestration while preserving its response and downstream error behavior.

- Reused the existing `JourneysService.remove()` operation, backed by the Journey DELETE client request, after Folder or Task creation failures.
- Awaited compensation before returning, logged failed deletion attempts, and preserved the original downstream response or thrown creation error.
- Added coverage proving Folder failure compensation, thrown Task failure compensation, and no deletion when Journey creation fails.

## 2026-10-14

### #JANUS-BFF-0027: Clarify Compose Task Mapping

**Work**: Plan / Build; Refactored Compose Journey task-item construction for readability without changing orchestration behavior.

- Named root Journey Tasks and nested Folder Tasks separately before combining them into the existing single bulk request.
- Preserved task ordering, parent assignment, and downstream request behavior.

## 2026-10-29

### #JANUS-BFF-0036: Forward MS-Users Internal Security Headers

**Work**: Plan / Build / Validate; Aligned the BFF `ms-users` HTTP client with the established `ms-journeys` internal authentication and identity propagation pattern.

- Added required `MS_USERS_API_KEY` configuration validation and timing-independent downstream API-key forwarding.
- Forwarded `X-User-Id` from the validated `AuthenticatedIdentity` for User collection and resource operations.
- Kept User registration API-key authenticated without adding `X-User-Id`, while preserving the existing BFF JWT-derived provisioning identity.
