# aws-api-gateway-spec-file-generator

A TypeScript utility for generating OpenAPI 3.0.1 specification files for use with AWS API Gateway. The core class, `OpenApiSpec`, lets you build a complete spec programmatically and export it as a JSON/YAML object ready for import into API Gateway.

---

## Installation

```bash
npm install api-spec-generator
```

**Peer dependencies:**

- [`zod`](https://github.com/colinhacks/zod) — for schema definitions. This also supplies the `JSONSchema` type

---

## Quick Start

```ts
import { OpenApiSpec } from "./src/OpenApiSpec";
import { z } from "zod";

const spec = new OpenApiSpec();

// 1. Set API metadata
spec.setInfoBlock({
  title: "This is my title",
  description: "this is my description",
  version: "This can be anything, but open api readers might be upset",
  contactEmail: "fake-email@gmail.com",
  contactName: "This can be a team name",
  contactUrl: "https://www.what-am-i-doing.com/help-me-please",
});

// 2. Set base server URL(s)
spec.setServers([
  { url: "https://abc123.execute-api.us-east-1.amazonaws.com/prod", description: "Production" },
]);

// 3. Set global request validation
spec.setGlobalRequestValidator("strict");

// 4. Configure CORS, if needed
spec.setCORS({
  allowOrigins: ["https://www.example.com"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["content-type", "x-amz-date"],
  allowCredentials: true,
  exposeHeaders: ["x-apigateway-header"],
  maxAge: 3600,
});

// 5. Configure binary media types, if needed
spec.setBinaryMediaTypes([
  "application/octet-stream",
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

// 6. Register a Lambda authorizer
spec.addSecuritySchemeAuthorizer({
  securityName: "myTokenAuthorizer",
  authorizerType: "token",
  authorizerUri: "arn:aws:apigateway:us-east-1:lambda:path/...",
  authorizerResultTtlInSeconds: 300,
});

// 7. Apply security globally
spec.setGlobalSecurity([{ myTokenAuthorizer: [] }]);

// 8. Register reusable schemas and responses
const UserSchema = z.object({ id: z.string().uuid(), email: z.string().email() });
spec.addSchema("User", UserSchema);

spec.addComponentResponse({
  schemaName: "Unauthorized",
  description: "Authentication required",
  schema: z.object({ message: z.string() }),
});

// 9. Add routes
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
    additionalResponses: [
      { statusCode: 400, contentSchema: "ErrorBody" },
      { statusCode: 401, contentSchema: "Unauthorized" },
    ],
  },
});

// 10. Export the spec
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
```

---

#### `setInfoBlock(params)`

Sets the top-level `info` block of the spec — required by the OpenAPI 3.0 standard.

| Parameter      | Type     | Required | Description                    |
| -------------- | -------- | -------- | ------------------------------ |
| `title`        | `string` | Yes      | Public-facing API name         |
| `version`      | `string` | Yes      | Version string, e.g. `"1.0.0"` |
| `description`  | `string` | Yes      | Short summary of the API       |
| `contactName`  | `string` | Yes      | Owner or team name             |
| `contactEmail` | `string` | Yes      | Contact email address          |
| `contactUrl`   | `string` | Yes      | Link to a team or docs page    |

```ts
spec.setInfoBlock({
  title: "User Management API",
  version: "2.1.0",
  description: "Handles user CRUD operations.",
  contactName: "Platform Team",
  contactEmail: "platform@example.com",
  contactUrl: "https://platform.example.com",
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

#### `setCORS(cors)`

Sets the `x-amazon-apigateway-cors` extension at the root level of the OpenAPI spec, which configures cross-origin resource sharing (CORS) for an HTTP API in AWS API Gateway. When present, API Gateway uses this configuration to automatically handle preflight `OPTIONS` requests and attach the appropriate CORS headers to responses.

> **Note:** `allowCredentials` cannot be `true` when `allowOrigins` contains `"*"`.

| Parameter          | Type       | Required | Description                                                                                                           |
| ------------------ | ---------- | -------- | --------------------------------------------------------------------------------------------------------------------- |
| `allowOrigins`     | `string[]` | Yes      | Origins permitted to make cross-origin requests, e.g. `["https://www.example.com"]`. Use `["*"]` to allow all origins |
| `allowMethods`     | `string[]` | Yes      | HTTP methods allowed in cross-origin requests, e.g. `["GET", "POST", "OPTIONS"]`                                      |
| `allowHeaders`     | `string[]` | Yes      | Request headers permitted in cross-origin requests, e.g. `["content-type", "x-amz-date"]`                             |
| `allowCredentials` | `boolean`  | Yes      | Whether cookies or authorization headers are included in cross-origin requests. Default: `false`                      |
| `exposeHeaders`    | `string[]` | Yes      | Response headers the browser is permitted to access from a cross-origin request                                       |
| `maxAge`           | `number`   | Yes      | Seconds the browser should cache the preflight response, reducing round-trips. e.g. `3600`                            |

```ts
spec.setCORS({
  allowOrigins: ["https://www.example.com"],
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["content-type", "x-amz-date", "x-apigateway-header"],
  allowCredentials: true,
  exposeHeaders: ["x-apigateway-header", "x-amz-date", "content-type"],
  maxAge: 3600,
});
```

---

#### `setBinaryMediaTypes(binaryMediaTypes)`

Sets the `x-amazon-apigateway-binary-media-types` extension at the root level of the OpenAPI spec. This tells API Gateway which MIME types should be treated as binary payloads, causing them to be base64-encoded when passing through the integration. Omitting this method means all content is treated as text.

Common use cases include file uploads, image serving, PDF downloads, and any endpoint that sends or receives non-UTF-8 data.

| Parameter          | Type       | Required | Description                                                                                                                |
| ------------------ | ---------- | -------- | -------------------------------------------------------------------------------------------------------------------------- |
| `binaryMediaTypes` | `string[]` | Yes      | Array of MIME type strings API Gateway should handle as binary. Supports wildcards, e.g. `"image/*"` to match all subtypes |

```ts
// Common binary types
spec.setBinaryMediaTypes([
  "application/octet-stream",
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

// Wildcard to catch all image subtypes
spec.setBinaryMediaTypes(["image/*", "application/octet-stream"]);
```

> **See also:** [`x-amazon-apigateway-binary-media-types` property](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-binary-media-types.html)

---

#### `addSecuritySchemeAuthorizer(params)`

Registers an AWS Lambda authorizer as a named security scheme under `components/securitySchemes`. Once registered, reference it by `securityName` in `setGlobalSecurity()` or per-route `routeSecurity`.

| Parameter                      | Type                   | Required | Description                                                                                                      |
| ------------------------------ | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| `securityName`                 | `string`               | Yes      | Reference name used in security requirements                                                                     |
| `authorizerType`               | `"token" \| "request"` | Yes      | `"token"` checks the `Authorization` header; `"request"` can inspect headers, query strings, and stage variables |
| `authorizerUri`                | `string`               | No       | Full Lambda invoke ARN. Defaults to the Terraform variable `${securityName_lambda_invoke_arn}`                   |
| `authorizerResultTtlInSeconds` | `number`               | No       | Seconds to cache a successful auth response. Range: 0–3600. Default: `0`                                         |

```ts
spec.addSecuritySchemeAuthorizer({
  securityName: "myTokenAuthorizer",
  authorizerType: "token",
  authorizerUri: "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:...",
  authorizerResultTtlInSeconds: 300,
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
```

---

#### `addComponentResponse(params)`

Registers a reusable response under `components/responses`. Once registered, reference it in `additionalResponses` by passing its name as a string with `refType: "response"`. Only added to the spec output if at least one response is registered.

| Parameter     | Type                                | Required | Description                                                                             |
| ------------- | ----------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| `schemaName`  | `string`                            | Yes      | Storage key, e.g. `"Unauthorized"`. Referenced as `#/components/responses/Unauthorized` |
| `schema`      | `z.ZodType \| JSONSchema \| string` | No       | Response body schema. Omit for bodyless responses (e.g. `204 No Content`)               |
| `description` | `string`                            | No       | Human-readable description. Defaults to `schemaName` if omitted                         |

```ts
spec.addComponentResponse({
  schemaName: "Unauthorized",
  description: "Authentication required",
  schema: z.object({ message: z.string() }),
});

// Reference it in a route:
additionalResponses: [{ statusCode: 401, contentSchema: "Unauthorized" }];
```

---

#### `addRoute(routeInfo)`

Adds an endpoint (path + HTTP method) to the spec. Registers the request/response schemas, path parameters, AWS Lambda proxy integration, and optional security. Throws if the same `routeName` + `method` combination is added more than once.

**Top-level fields:**

| Parameter       | Type                         | Required | Description                                                       |
| --------------- | ---------------------------- | -------- | ----------------------------------------------------------------- |
| `routeName`     | `string`                     | Yes      | URL path, e.g. `"/users/{id}"`. Use `{paramName}` for path params |
| `method`        | `HttpMethod`                 | Yes      | `"get"` \| `"post"` \| `"put"` \| `"patch"` \| `"delete"`         |
| `summary`       | `string`                     | Yes      | Short, human-readable description of the endpoint                 |
| `requestInfo`   | `RequestInfo`                | Yes      | Describes the incoming request (see below)                        |
| `responseInfo`  | `ResponseInfo`               | Yes      | Describes the success response and error codes (see below)        |
| `routeSecurity` | `Record<string, string[]>[]` | No       | Per-route security override. Pass `[]` to make a route public     |

**`requestInfo` fields:**

| Field               | Type                              | Required | Description                                                                                                     |
| ------------------- | --------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `contentSchema`     | `ZodType \| JSONSchema \| string` | No       | Request body schema. Omit for routes with no body (e.g. GET)                                                    |
| `contentType`       | `string`                          | No       | Request body MIME type. Default: `"application/json"`                                                           |
| `requestParameters` | `RequestParameter[]`              | No       | Path, query, or header parameters. Each entry: `{ name, type: "path"\|"query"\|"header", description, schema }` |
| `requestValidator`  | `RequestValidationOptions`        | No       | Per-route validator override. Overrides the global setting                                                      |

**`responseInfo` fields:**

| Field                   | Type                              | Required | Description                                                                                |
| ----------------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------ |
| `happyPathStatusCode`   | `number`                          | Yes      | HTTP status code for the success case, e.g. `200` or `201`                                 |
| `description`           | `string`                          | Yes      | Human-readable description of the success response                                         |
| `contentType`           | `string`                          | Yes      | Response MIME type, e.g. `"application/json"`                                              |
| `contentSchema`         | `ZodType \| JSONSchema \| string` | Yes      | Response body schema or a name reference to a registered schema                            |
| `additionalResponses`   | `AdditionalResponses[]`           | No       | Extra responses to document. Replaces `additionalStatusCodes` (see below)                  |
| `additionalStatusCodes` | `number[]`                        | No       | ⚠️ **Deprecated.** Use `additionalResponses` instead. Will log a console warning when used |

**`AdditionalResponses` fields:**

| Field           | Type                              | Required | Description                                                                                      |
| --------------- | --------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `statusCode`    | `HttpStatusCodes`                 | Yes      | The HTTP status code to document, e.g. `404`                                                     |
| `description`   | `string`                          | No       | Human-readable description. Defaults to the standard HTTP reason phrase                          |
| `contentType`   | `string`                          | No       | Response MIME type. Defaults to `"application/json"`                                             |
| `contentSchema` | `ZodType \| JSONSchema \| string` | No       | Response body schema. Omit for bodyless responses. When a string, behaviour depends on `refType` |

**`additionalResponses` scenarios:**

```ts
additionalResponses: [
  // 1. No schema — description only (e.g. 404 Not Found)
  { statusCode: 404 },

  // 2. Inline Zod schema
  {
    statusCode: 409,
    description: "Conflict",
    contentSchema: z.object({ conflictingId: z.string() }),
  },

  // 3. Inline raw JSON Schema
  { statusCode: 422, contentSchema: { type: "object", properties: { field: { type: "string" } } } },

  // 4. $ref to components/responses (registered via addComponentResponse)
  { statusCode: 401, contentSchema: "Unauthorized" },
];
```

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
    additionalResponses: [
      { statusCode: 400, contentSchema: "ErrorBody" },
      { statusCode: 401, contentSchema: "Unauthorized" },
      {
        statusCode: 409,
        description: "Conflict",
        contentSchema: z.object({ conflictingId: z.string() }),
      },
    ],
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
    additionalResponses: [{ statusCode: 404 }],
  },
});
```

---

#### `getOpenApiSpecContent()`

Returns the fully assembled spec object. Call this **after** all routes, schemas, and metadata have been configured.

**Returns:** `SpecFileContent` — the complete OpenAPI 3.0.1 object, including all paths, components, security definitions, and `x-amazon-apigateway-*` extensions. The `components.responses` key is only included if at least one response has been registered via `addComponentResponse()`.

```ts
const content = spec.getOpenApiSpecContent();
fs.writeFileSync("api-spec.json", JSON.stringify(content, null, 2));
```

---

## Schema Input Options

Anywhere a schema is accepted (`contentSchema`, `addSchema`, `addComponentResponse`), you can pass one of three forms:

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
4. `setCORS()` — cross-origin resource sharing _(optional)_
5. `setBinaryMediaTypes()` — binary payload handling _(optional)_
6. `addSecuritySchemeAuthorizer()` — register authorizers
7. `setGlobalSecurity()` — apply them globally
8. `addSchema()` — register reusable schemas
9. `addComponentResponse()` — register reusable responses _(optional)_
10. `addRoute()` — add endpoints (repeat as needed)
11. `getOpenApiSpecContent()` — export the final spec

---

## License

MIT
