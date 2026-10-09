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
