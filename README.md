# aws-api-gateway-spec-file-generator

A TypeScript utility for generating OpenAPI 3.0.1 specification files for use with AWS API Gateway. The core class, `OpenApiSpec`, lets you build a complete spec programmatically and export it as a JSON/YAML object ready for import into API Gateway.

---

## Installation

```bash
npm install api-spec-generator
```

**Peer dependencies:**

- [`zod`](https://github.com/colinhacks/zod) — for schema definitions. This also supplies the `_JSONSchema` type
- [`http-status-codes`](https://www.npmjs.com/package/http-status-codes) — for auto-generated response descriptions

---

## Quick Start

```ts
import { OpenApiSpec } from "./src/OpenApiSpec";
import { z } from "zod";

const spec = new OpenApiSpec();

// 1. Set API metadata
spec.setInfoBlock({
  title: "My API",
  version: "1.0.0",
  description: "Handles user management.",
  contactEmail: "team@example.com",
});

// 2. Set base server URL(s)
spec.setServers([
  { url: "https://abc123.execute-api.us-east-1.amazonaws.com/prod", description: "Production" },
]);

// 3. Set global request validation
spec.setGlobalRequestValidator("strict");

// 4. Register a Lambda authorizer
spec.addSecuritySchemeAuthorizer({
  securityName: "myTokenAuthorizer",
  authorizerType: "token",
  authorizerUri: "arn:aws:apigateway:us-east-1:lambda:path/...",
  authorizerResultsCacheTtlInSeconds: 300,
});

// 5. Apply security globally
spec.setGlobalSecurity([{ myTokenAuthorizer: [] }]);

// 6. Register a reusable schema
const UserSchema = z.object({ id: z.string().uuid(), email: z.string().email() });
spec.addSchema("User", UserSchema);

// 7. Add routes
spec.addRoute({
  routeName: "/users",
  method: "post",
  summary: "Create a new user",
  requestInfo: {
    contentSchema: z.object({ email: z.string().email(), name: z.string() }),
    requestValidator: "request-body-only",
  },
  responseInfo: {
    happyPathStatusCode: 201,
    description: "User created successfully",
    contentType: "application/json",
    contentSchema: "User",
    additionalStatusCodes: [400, 409],
  },
});

// 8. Export the spec
const content = spec.getOpenApiSpecContent();
import fs from "fs";
fs.writeFileSync("api-spec.json", JSON.stringify(content, null, 2));
```

---

## Class: `OpenApiSpec`

### Overview

`OpenApiSpec` builds an OpenAPI 3.0.1 document incrementally. It includes AWS-specific extensions (`x-amazon-apigateway-*`) for Lambda proxy integrations and request validation.

All configuration methods mutate the internal spec state. Call `getOpenApiSpecContent()` at the end to retrieve the final object.

---

### Public Methods

#### `setTags(tags)`

Sets the top-level tags array for the OpenAPI spec. Tags are used to group related routes together in documentation tools such as Swagger UI and Redoc. Define them here, then reference them by name in individual routes via the `tags` field on `addRoute()`.

| Parameter | Type    | Required | Description                                                                     |
| --------- | ------- | -------- | ------------------------------------------------------------------------------- |
| `tags`    | `Tag[]` | Yes      | Array of tag objects. Each tag must include a `name` and optional `description` |

```ts
spec.setTags([
  { name: "Users", description: "User management endpoints" },
  { name: "Orders", description: "Order processing endpoints" },
]);
` ` `
```

---

#### `setInfoBlock(params)`

Sets the top-level `info` block of the spec — required by the OpenAPI 3.0 standard.

| Parameter      | Type     | Required | Description                    |
| -------------- | -------- | -------- | ------------------------------ |
| `title`        | `string` | Yes      | Public-facing API name         |
| `version`      | `string` | Yes      | Version string, e.g. `"1.0.0"` |
| `description`  | `string` | Yes      | Short summary of the API       |
| `contactName`  | `string` | No       | Owner or team name             |
| `contactEmail` | `string` | No       | Contact email address          |
| `contactUrl`   | `string` | No       | Link to a team or docs page    |

```ts
spec.setInfoBlock({
  title: "User Management API",
  version: "2.1.0",
  description: "Handles user CRUD operations.",
  contactName: "Platform Team",
  contactEmail: "platform@example.com",
});
```

---

#### `setServers(servers)`

Defines the base URL(s) listed under the `servers` array. For API Gateway, supply the invoke URL for each stage.

| Parameter | Type       | Required | Description                              |
| --------- | ---------- | -------- | ---------------------------------------- |
| `servers` | `Server[]` | Yes      | Array of `{ url, description? }` objects |

```ts
spec.setServers([
  { url: "https://abc123.execute-api.us-east-1.amazonaws.com/prod", description: "Production" },
  { url: "https://abc123.execute-api.us-east-1.amazonaws.com/dev", description: "Development" },
]);
```

---

#### `setGlobalRequestValidator(requestValidator)`

Sets the default AWS request validator applied to all routes that do not specify their own. Defaults to `"none"`.

| Value                      | Validates body | Validates params |
| -------------------------- | :------------: | :--------------: |
| `"none"` _(default)_       |       ✗        |        ✗         |
| `"strict"`                 |       ✓        |        ✓         |
| `"request-body-only"`      |       ✓        |        ✗         |
| `"request-parameter-only"` |       ✗        |        ✓         |

```ts
spec.setGlobalRequestValidator("strict");
```

---

#### `addSecuritySchemeAuthorizer(params)`

Registers an AWS Lambda authorizer as a named security scheme under `components/securitySchemes`. Once registered, reference it by `securityName` in `setGlobalSecurity()` or per-route `routeSecurity`.

| Parameter                            | Type                   | Required | Description                                                                                                      |
| ------------------------------------ | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `securityName`                       | `string`               | Yes      | Reference name used in security requirements                                                                     |
| `authorizerType`                     | `"token" \| "request"` | Yes      | `"token"` checks the `Authorization` header; `"request"` can inspect headers, query strings, and stage variables |
| `authorizerUri`                      | `string`               | No       | Full Lambda invoke ARN. Defaults to the Terraform variable `${securityName_lambda_invoke_arn}`                   |
| `authorizerResultsCacheTtlInSeconds` | `number`               | No       | Seconds to cache a successful auth response. Range: 0–3600. Default: `0`                                         |

```ts
spec.addSecuritySchemeAuthorizer({
  securityName: "myTokenAuthorizer",
  authorizerType: "token",
  authorizerUri: "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:...",
  authorizerResultsCacheTtlInSeconds: 300,
});
```

---

#### `setGlobalSecurity(security)`

Applies security requirements to all routes by default. Keys must match scheme names registered via `addSecuritySchemeAuthorizer()`. Individual routes can override this via `routeSecurity` in `addRoute()`.

| Parameter  | Type         | Required | Description                                                          |
| ---------- | ------------ | -------- | -------------------------------------------------------------------- |
| `security` | `Security[]` | Yes      | Array of security requirement objects, e.g. `[{ myAuthorizer: [] }]` |

```ts
spec.setGlobalSecurity([{ myTokenAuthorizer: [] }]);
```

---

#### `addSchema(schemaName, schema)`

Registers a reusable schema under `components/schemas`. Once registered, reference it anywhere a schema is accepted by passing its name as a string instead of the full schema object.

| Parameter    | Type                      | Required | Description                                                              |
| ------------ | ------------------------- | -------- | ------------------------------------------------------------------------ |
| `schemaName` | `string`                  | Yes      | Storage key, e.g. `"User"`. Referenced as `#/components/schemas/User`    |
| `schema`     | `z.ZodType \| JSONSchema` | Yes      | A Zod schema (auto-converted to JSON Schema) or a raw JSON Schema object |

```ts
const UserSchema = z.object({ id: z.string().uuid(), email: z.string().email() });
spec.addSchema("User", UserSchema);

// Reference by name in a route:
responseInfo: { contentSchema: "User", ... }
```

---

#### `addRoute(routeInfo)`

Adds an endpoint (path + HTTP method) to the spec. Registers the request/response schemas, path parameters, AWS Lambda proxy integration, and optional security. Throws if the same `routeName` + `method` combination is added more than once.

**Top-level fields:**

| Parameter       | Type                             | Required | Description                                                             |
| --------------- | -------------------------------- | -------- | ----------------------------------------------------------------------- |
| `routeName`     | `string`                         | Yes      | URL path, e.g. `"/users/{id}"`. Use `{paramName}` for path params       |
| `method`        | `HttpMethod`                     | Yes      | `"get"` \| `"post"` \| `"put"` \| `"patch"` \| `"delete"`               |
| `summary`       | `string`                         | Yes      | Short, human-readable description of the endpoint                       |
| `requestInfo`   | `RequestInfo`                    | Yes      | Describes the incoming request (see below)                              |
| `responseInfo`  | `ResponseInfo`                   | Yes      | Describes the success response and error codes (see below)              |
| `routeSecurity` | `Record<string, string[]>[]`     | No       | Per-route security override. Pass `[]` to make a route public           |
| `responses`     | `Record<string, ResponseObject>` | No       | Optional initial responses map, merged before `responseInfo` is applied |

**`requestInfo` fields:**

| Field               | Type                              | Required | Description                                                                                                     |
| ------------------- | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `contentSchema`     | `ZodType \| JSONSchema \| string` | No       | Request body schema. Omit for routes with no body (e.g. GET)                                                    |
| `contentType`       | `string`                          | No       | Request body MIME type. Default: `"application/json"`                                                           |
| `requestParameters` | `RequestParameter[]`              | No       | Path, query, or header parameters. Each entry: `{ name, type: "path"\|"query"\|"header", description, schema }` |
| `requestValidator`  | `RequestValidationOptions`        | No       | Per-route validator override. Overrides the global setting                                                      |

**`responseInfo` fields:**

| Field                   | Type                              | Required | Description                                                                              |
| ----------------------- | --------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `happyPathStatusCode`   | `number`                          | Yes      | HTTP status code for the success case, e.g. `200` or `201`                               |
| `description`           | `string`                          | Yes      | Human-readable description of the success response                                       |
| `contentType`           | `string`                          | Yes      | Response MIME type, e.g. `"application/json"`                                            |
| `contentSchema`         | `ZodType \| JSONSchema \| string` | Yes      | Response body schema or a name reference to a registered schema                          |
| `additionalStatusCodes` | `number[]`                        | Yes      | Extra status codes to document (e.g. `[400, 404, 500]`). Descriptions are auto-generated |

**Throws:** `Error` if `method` already exists for `routeName`.

```ts
// POST /users — with request body
spec.addRoute({
  routeName: "/users",
  method: "post",
  summary: "Create a new user",
  requestInfo: {
    contentSchema: z.object({ email: z.string().email(), name: z.string() }),
    contentType: "application/json",
    requestValidator: "request-body-only",
  },
  responseInfo: {
    happyPathStatusCode: 201,
    description: "User created successfully",
    contentType: "application/json",
    contentSchema: "User",
    additionalStatusCodes: [400, 409],
  },
  routeSecurity: [{ myTokenAuthorizer: [] }],
});

// GET /users/{id} — with path parameter, no body
spec.addRoute({
  routeName: "/users/{id}",
  method: "get",
  summary: "Get a user by ID",
  requestInfo: {
    requestParameters: [
      { name: "id", type: "path", description: "The user's UUID", schema: z.string().uuid() },
    ],
  },
  responseInfo: {
    happyPathStatusCode: 200,
    description: "User found",
    contentType: "application/json",
    contentSchema: "User",
    additionalStatusCodes: [404],
  },
});
```

---

#### `getOpenApiSpecContent()`

Returns the fully assembled spec object. Call this **after** all routes, schemas, and metadata have been configured.

**Returns:** `SpecFileContent` — the complete OpenAPI 3.0.1 object, including all paths, components, security definitions, and `x-amazon-apigateway-*` extensions.

```ts
const content = spec.getOpenApiSpecContent();
fs.writeFileSync("api-spec.json", JSON.stringify(content, null, 2));
```

---

## Schema Input Options

Anywhere a schema is accepted (`contentSchema`, `addSchema`), you can pass one of three forms:

| Form               | Example                                   | When to use                                     |
| ------------------ | ----------------------------------------- | ----------------------------------------------- |
| Zod schema         | `z.object({ id: z.string() })`            | Define schemas inline with full type safety     |
| Schema name string | `"User"`                                  | Reference a schema registered via `addSchema()` |
| Raw JSON Schema    | `{ type: "object", properties: { ... } }` | Use an existing JSON Schema directly            |

---

## AWS Integration Notes

Every route registered via `addRoute()` automatically receives an `x-amazon-apigateway-integration` block configured for **Lambda proxy integration**:

```json
{
  "x-amazon-apigateway-integration": {
    "type": "aws_proxy",
    "httpMethod": "POST",
    "uri": "${routename_method_lambda_invoke_arn}",
    "payloadFormatVersion": "2.0"
  }
}
```

The `uri` variable name is derived from the route path and method, making it compatible with Terraform and CDK variable injection. For example, the route `GET /users/{id}` produces the variable `${users_id_get_lambda_invoke_arn}`.

---

## Recommended Setup Order

Follow this order when building a spec to avoid reference errors:

1. `setInfoBlock()` — API metadata
2. `setServers()` — base URLs
3. `setGlobalRequestValidator()` — default validation mode
4. `addSecuritySchemeAuthorizer()` — register authorizers
5. `setGlobalSecurity()` — apply them globally
6. `addSchema()` — register reusable schemas
7. `addRoute()` — add endpoints (repeat as needed)
8. `getOpenApiSpecContent()` — export the final spec

---

## License

MIT
