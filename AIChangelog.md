## 2026-10-09

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
