import { z } from "zod";
import { AddRouteParams } from "../types/AddRouteParams";
import { PathItem, ResponseObject } from "../types/PathItem";
import { RequestValidationOptions, RequestValidators } from "../types/RequestValidators";
import { SpecFileContent } from "../types/SpecFileContent";
import { RequestParameter } from "../types/RequestParameter";
import { Authorizer, AwsAuthorizerScheme, SecurityScheme } from "../types/AwsAuthorizerSheme";
import { ZodJsonSchemaOmitted } from "../types/ZodJsonSchemaOmitted";
import { Schemas } from "../types/Schemas";
import { InfoBlockInput, InfoBlockOutput } from "../types/InfoBlock";
import { HttpMethod } from "../types/HttpMethod";
import { Server } from "../types/Server";
import { JSONSchema } from "zod/v4/core/json-schema.cjs";
import { Security } from "../types/Security";
import { Prettify } from "../types/Prettify";
import { RequestInfo } from "../types/RequestInfo";
import { ResponseInfo } from "../types/ResponseInfo";
import { getReasonPhrase } from "http-status-codes";
import { Tag } from "../types/Tag";
import { CORS } from "../types/CORS";
/**
 * Builds an OpenAPI 3.0.1 specification object for use with AWS API Gateway.
 *
 * Construct an instance, configure it using the public methods below, then call
 * `getOpenApiSpecContent()` to retrieve the final spec object — which you can
 * serialise to JSON/YAML and import directly into API Gateway.
 *
 * **Typical usage**
 * ```ts
 * const spec = new OpenApiSpec();
 *
 * spec.setInfoBlock({ title: "My API", version: "1.0.0", description: "..." });
 * spec.setServers([{ url: "https://api.example.com" }]);
 * spec.setGlobalRequestValidator("strict");
 *
 * spec.addSecuritySchemeAuthorizer({
 *   securityName: "myAuthorizer",
 *   authorizerType: "token",
 *   authorizerUri: "arn:aws:...",
 * });
 * spec.setGlobalSecurity([{ myAuthorizer: [] }]);
 *
 * spec.addRoute({
 *   routeName: "/users/{id}",
 *   method: "get",
 *   summary: "Fetch a user by ID",
 *   requestInfo: { requestParameters: [{ name: "id", type: "path", description: "User ID", schema: z.string() }] },
 *   responseInfo: { happyPathStatusCode: 200, description: "Success", contentType: "application/json", contentSchema: UserSchema, additionalStatusCodes: [404] },
 * });
 *
 * const content = spec.getOpenApiSpecContent();
 * ```
 */
export class OpenApiSpec {
  private openApi: string = "3.0.1";
  private paths: Record<string, PathItem> = {};
  private securitySchemes: SecurityScheme = {};
  private info: InfoBlockOutput = {
    title: "",
    version: "",
    description: "",
    contact: { url: "", name: "", email: "" },
  };
  private security: Security[] = [];
  private schemas: Schemas = {};
  private xAmazonApigatewayRequestValidators: RequestValidators = {
    none: {
      validateRequestBody: false,
      validateRequestParameters: false,
    },
    strict: {
      validateRequestBody: true,
      validateRequestParameters: true,
    },
    "request-body-only": {
      validateRequestBody: true,
      validateRequestParameters: false,
    },
    "request-parameter-only": {
      validateRequestBody: false,
      validateRequestParameters: true,
    },
  };
  private xAmazonApigatewayRequestValidator: RequestValidationOptions = "none";
  private CORS: CORS | null = null;
  private servers: Server[] = [];
  private tags: Tag[] = [];

  // ─────────────────────────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Returns the fully assembled OpenAPI spec object.
   *
   * Call this **after** all routes, schemas, security schemes, and metadata have
   * been configured. The returned object can be serialised directly to JSON or
   * YAML for import into AWS API Gateway.
   *
   * @returns {SpecFileContent} The complete OpenAPI 3.0.1 specification object,
   *   including all paths, components, security definitions, and AWS-specific
   *   extensions (`x-amazon-apigateway-*`).
   *
   * @example
   * const spec = new OpenApiSpec();
   * // ... configure spec ...
   * const content = spec.getOpenApiSpecContent();
   * fs.writeFileSync("api-spec.json", JSON.stringify(content, null, 2));
   */
  public getOpenApiSpecContent(): SpecFileContent {
    const specContent: SpecFileContent = {
      openapi: this.openApi,
      paths: this.paths,
      info: this.info,
      tags: this.tags,
      servers: this.servers,
      components: {
        securitySchemes: this.securitySchemes,
        schemas: this.schemas,
      },
      "x-amazon-apigateway-request-validators": this.xAmazonApigatewayRequestValidators,
      "x-amazon-apigateway-request-validator": this.xAmazonApigatewayRequestValidator,
      "x-amazon-apigateway-gateway-responses": {
        BAD_REQUEST_BODY: {
          statusCode: 400,
          responseTemplates: {
            "application/json": JSON.stringify({
              message: "$context.error.validationErrorString",
              error: "BAD_REQUEST_BODY",
            }),
          },
          responseParameters: {
            "gatewayresponse.header.Content-Type": "'application/json'",
          },
        },
        BAD_REQUEST_PARAMETERS: {
          statusCode: 400,
          responseTemplates: {
            "application/json": JSON.stringify({
              message: "$context.error.validationErrorString",
              error: "BAD_REQUEST_PARAMETERS",
            }),
          },
          responseParameters: {
            "gatewayresponse.header.Content-Type": "'application/json'",
          },
        },
      },
      security: this.security,
    };

    if (this.CORS) {
      specContent["x-amazon-apigateway-cors"] = this.CORS;
    }

    return specContent;
  }

  /**
   * Sets the `x-amazon-apigateway-cors` extension on the OpenAPI spec, which configures
   * cross-origin resource sharing (CORS) for an HTTP API in AWS API Gateway.
   *
   * This extension is applied at the root level of the OpenAPI structure. When present,
   * API Gateway uses it to automatically handle preflight `OPTIONS` requests and attach
   * the appropriate CORS headers to responses.
   *
   * @see {@link https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-swagger-extensions-cors-configuration.html | x-amazon-apigateway-cors object}
   * @see {@link https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-cors.html | Configure CORS for HTTP APIs in API Gateway}
   *
   * @param cors - The CORS configuration object.
   * @param cors.allowOrigins - The origins permitted to make cross-origin requests, e.g. `["https://www.example.com"]`. Use `["*"]` to allow all origins.
   * @param cors.allowMethods - The HTTP methods allowed in cross-origin requests, e.g. `["GET", "POST", "OPTIONS"]`.
   * @param cors.allowHeaders - The request headers permitted in cross-origin requests, e.g. `["content-type", "x-amz-date"]`.
   * @param cors.allowCredentials - Whether cookies or authorization headers are included in cross-origin requests. Cannot be `true` when `allowOrigins` contains `"*"`.
   * @param cors.exposeHeaders - Response headers the browser is permitted to access from a cross-origin request, e.g. `["x-apigateway-header"]`.
   * @param cors.maxAge - Number of seconds the browser should cache the preflight response. Reduces the number of preflight round-trips. e.g. `3600`.
   *
   * @example
   * spec.setCORS({
   *   allowOrigins: ["https://www.example.com"],
   *   allowMethods: ["GET", "POST", "OPTIONS"],
   *   allowHeaders: ["content-type", "x-amz-date", "x-apigateway-header"],
   *   allowCredentials: true,
   *   exposeHeaders: ["x-apigateway-header", "x-amz-date", "content-type"],
   *   maxAge: 3600,
   * });
   */
  public setCORS(cors: Prettify<CORS>): void {
    this.CORS = cors;
  }

  /**
   * Sets the default AWS API Gateway request validator applied to **all** routes
   * that do not specify their own validator.
   *
   * The validator controls whether API Gateway checks the request body, query/path
   * parameters, or both before forwarding the request to the Lambda integration.
   *
   * | Value                    | Validates body | Validates params |
   * |--------------------------|:--------------:|:----------------:|
   * | `"none"` *(default)*     | ✗              | ✗                |
   * | `"strict"`               | ✓              | ✓                |
   * | `"request-body-only"`    | ✓              | ✗                |
   * | `"request-parameter-only"` | ✗            | ✓                |
   *
   * @param {RequestValidationOptions} requestValidator - One of `"none"`,
   *   `"strict"`, `"request-body-only"`, or `"request-parameter-only"`.
   *
   * @example
   * spec.setGlobalRequestValidator("strict");
   * // Every route now validates both body and parameters unless overridden.
   */
  public setGlobalRequestValidator(requestValidator: RequestValidationOptions): void {
    this.xAmazonApigatewayRequestValidator = requestValidator;
  }

  /**
   * Sets the top-level tags array for the OpenAPI spec.
   *
   * Tags are used to group related routes together in documentation tools
   * such as Swagger UI and Redoc. Define them here, then reference them
   * by name in individual routes via the `tags` field on `addRoute()`.
   *
   * @param {Tag[]} tags - An array of tag objects. Each tag must include a
   *   `name` property and may optionally include a `description`.
   *
   * @example
   * spec.setTags([
   *   { name: "Users", description: "User management endpoints" },
   *   { name: "Orders", description: "Order processing endpoints" },
   * ]);
   */
  public setTags(tags: Tag[]): void {
    this.tags = tags;
  }

  /**
   * Defines the server base URLs listed in the OpenAPI spec.
   *
   * These appear under the top-level `servers` array and tell API clients where
   * the API is hosted. For AWS API Gateway you typically supply the invoke URL
   * for each stage you deploy to (e.g. dev, staging, prod).
   *
   * @param {Prettify<Server>[]} servers - An array of server objects. Each object
   *   must include a `url` property and may optionally include a `description`.
   *
   * @example
   * spec.setServers([
   *   { url: "https://abc123.execute-api.us-east-1.amazonaws.com/prod", description: "Production" },
   *   { url: "https://abc123.execute-api.us-east-1.amazonaws.com/dev",  description: "Development" },
   * ]);
   */
  public setServers(servers: Prettify<Server>[]) {
    this.servers = servers;
  }

  /**
   * Registers an AWS Lambda authorizer as a named security scheme.
   *
   * Once registered, the scheme can be referenced by name in `setGlobalSecurity()`
   * or via the `routeSecurity` field on individual routes.
   *
   * AWS API Gateway supports two authorizer types:
   * - **`"token"`** – expects a bearer token in the `Authorization` header.
   * - **`"request"`** – can inspect headers, query strings, stage variables, etc.
   *
   * @param {Prettify<AwsAuthorizerScheme>} params
   * @param {string}  params.securityName - The name used to reference this
   *   authorizer in security requirements (e.g. `"myTokenAuthorizer"`).
   * @param {"token" | "request"} params.authorizerType - The Lambda authorizer
   *   type. Use `"token"` for simple bearer-token flows; `"request"` for more
   *   complex inspection logic.
   * @param {string}  [params.authorizerUri] - The full ARN of the authorizer
   *   Lambda's invoke URL. If omitted, defaults to the Terraform/CDK template
   *   variable `${securityName_lambda_invoke_arn}`.
   * @param {number}  [params.authorizerResultsCacheTtlInSeconds=0] - How long
   *   (in seconds) API Gateway caches a successful authorizer response. Set to
   *   `0` to disable caching. Max value is `3600` (1 hour).
   *
   * @example
   * spec.addSecuritySchemeAuthorizer({
   *   securityName: "myTokenAuthorizer",
   *   authorizerType: "token",
   *   authorizerUri: "arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:MyAuthFunction/invocations",
   *   authorizerResultsCacheTtlInSeconds: 300,
   * });
   *
   * // Reference it globally:
   * spec.setGlobalSecurity([{ myTokenAuthorizer: [] }]);
   */
  public addSecuritySchemeAuthorizer({
    securityName,
    authorizerType,
    authorizerUri,
    authorizerResultTtlInSeconds = 0,
  }: Prettify<AwsAuthorizerScheme>): void {
    const authorizer: Authorizer = {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      "x-amazon-apigateway-authtype": "custom",
      "x-amazon-apigateway-authorizer": {
        type: authorizerType,
        authorizerUri: authorizerUri ?? `\${${securityName}_lambda_invoke_arn}`,
        authorizerResultTtlInSeconds,
      },
    };

    if (authorizerType === "token") {
      authorizer["x-amazon-apigateway-authorizer"].identitySource =
        "method.request.header.Authorization";
    }

    this.securitySchemes[securityName] = authorizer;
  }

  /**
   * Sets the global security requirements applied to **every** route in the spec.
   *
   * Each element in the array is a security requirement object whose keys map to
   * security scheme names registered via `addSecuritySchemeAuthorizer()`, and
   * whose values are scope arrays (typically `[]` for Lambda authorizers).
   *
   * Individual routes can override this by passing `routeSecurity` to `addRoute()`.
   *
   * @param {Prettify<Security>[]} security - Array of security requirement objects.
   *
   * @example
   * // Require the "myTokenAuthorizer" scheme on all routes by default:
   * spec.setGlobalSecurity([{ myTokenAuthorizer: [] }]);
   *
   * // Multiple schemes (both must pass):
   * spec.setGlobalSecurity([{ myTokenAuthorizer: [] }, { apiKeyAuth: [] }]);
   */
  public setGlobalSecurity(security: Prettify<Security>[]) {
    this.security = security;
  }

  /**
   * Registers a reusable schema in the `components/schemas` section of the spec.
   *
   * Registering a schema here allows you to reference it by name (as a `$ref`)
   * anywhere a schema is accepted — e.g. in `requestInfo.contentSchema` or
   * `responseInfo.contentSchema` — instead of inlining the full schema each time.
   *
   * @param {string} schemaName - The name under which the schema is stored.
   *   Used as the `$ref` key: `#/components/schemas/<schemaName>`.
   * @param {z.ZodType | _JSONSchema} schema - Either a Zod schema (automatically
   *   converted to JSON Schema) or a raw JSON Schema object.
   *
   * @example
   * // Register a Zod schema:
   * const UserSchema = z.object({ id: z.string(), email: z.string().email() });
   * spec.addSchema("User", UserSchema);
   *
   * // Reference it by name in a route:
   * spec.addRoute({
   *   ...
   *   responseInfo: {
   *     contentSchema: "User",   // ← string reference to #/components/schemas/User
   *     ...
   *   },
   * });
   */
  public addSchema(schemaName: string, schema: z.ZodType | JSONSchema): void {
    const rest = this.getSchemaObject(schema);
    this.schemas[schemaName] = rest;
  }

  /**
   * Sets the `info` block of the OpenAPI spec (title, version, description, and
   * contact details).
   *
   * This metadata is displayed by documentation tools such as Swagger UI and
   * Redoc, and is required by the OpenAPI 3.0 specification.
   *
   * @param {Prettify<InfoBlockInput>} params
   * @param {string} params.title        - The public-facing name of the API.
   * @param {string} params.version      - The API version string (e.g. `"1.0.0"`).
   * @param {string} params.description  - A short description of what the API does.
   * @param {string} [params.contactName]  - Name of the API owner / team.
   * @param {string} [params.contactEmail] - Contact email address.
   * @param {string} [params.contactUrl]   - URL to a contact page or team page.
   *
   * @example
   * spec.setInfoBlock({
   *   title: "User Management API",
   *   version: "2.1.0",
   *   description: "Handles user CRUD operations.",
   *   contactName: "Platform Team",
   *   contactEmail: "platform@example.com",
   *   contactUrl: "https://example.com/team",
   * });
   */
  public setInfoBlock({
    title,
    description,
    version,
    contactName,
    contactEmail,
    contactUrl,
  }: Prettify<InfoBlockInput>): void {
    this.info = {
      title,
      description,
      version,
      contact: {
        name: contactName,
        email: contactEmail,
        url: contactUrl,
      },
    };
  }

  /**
   * Adds a single route (path + HTTP method) to the spec, along with its request
   * schema, response schema, security, and AWS Lambda integration.
   *
   * Throws if the same `routeName` + `method` combination is added more than once.
   *
   * @param {Prettify<AddRouteParams>} routeInfo - Configuration object for the route.
   *
   * @param {string} routeInfo.routeName
   *   The URL path for this endpoint. Use `{paramName}` syntax for path parameters.
   *   Example: `"/users/{id}"`
   *
   * @param {HttpMethod} routeInfo.method
   *   The HTTP method: `"get"` | `"post"` | `"put"` | `"patch"` | `"delete"`.
   *
   * @param {string} routeInfo.summary
   *   A short, human-readable description of what the endpoint does.
   *   Shown as the endpoint title in Swagger UI / Redoc.
   *
   * @param {RequestInfo} routeInfo.requestInfo
   *   Describes the incoming request shape.
   *   - `contentSchema` — Zod schema, JSON Schema object, or schema name string
   *     describing the request body. Omit for routes with no body (e.g. GET).
   *   - `contentType` — MIME type of the request body (default: `"application/json"`).
   *   - `requestParameters` — Array of path / query / header parameters.
   *     Each entry: `{ name, type: "path"|"query"|"header", description, schema }`.
   *   - `requestValidator` — Per-route override of the global validator:
   *     `"none"` | `"strict"` | `"request-body-only"` | `"request-parameter-only"`.
   *
   * @param {ResponseInfo} routeInfo.responseInfo
   *   Describes the successful response and any additional status codes.
   *   - `happyPathStatusCode` — HTTP status code for the success case (e.g. `200`).
   *   - `description` — Human-readable description of the success response.
   *   - `contentType` — MIME type of the response body (e.g. `"application/json"`).
   *   - `contentSchema` — Zod schema, JSON Schema object, or schema name string
   *     describing the response body.
   *   - `additionalStatusCodes` — Extra status codes to document (e.g. `[400, 404, 500]`).
   *     Their descriptions are auto-generated from the HTTP standard phrase.
   *
   * @param {Record<string, ResponseObject>} [routeInfo.responses={}]
   *   Optional initial responses map. Merged before `responseInfo` is applied.
   *
   * @param {Record<string, string[]>[]} [routeInfo.routeSecurity]
   *   Per-route security requirements. Overrides the global security set via
   *   `setGlobalSecurity()`. Pass an empty array `[]` to make a route public.
   *   Example: `[{ myTokenAuthorizer: [] }]`
   *
   * @throws {Error} If the `method` already exists for `routeName`.
   *
   * @example
   * // POST /users — create a new user
   * spec.addRoute({
   *   routeName: "/users",
   *   method: "post",
   *   summary: "Create a new user",
   *   requestInfo: {
   *     contentSchema: z.object({ email: z.string().email(), name: z.string() }),
   *     contentType: "application/json",
   *     requestValidator: "request-body-only",
   *   },
   *   responseInfo: {
   *     happyPathStatusCode: 201,
   *     description: "User created successfully",
   *     contentType: "application/json",
   *     contentSchema: "User",            // references a schema registered via addSchema()
   *     additionalStatusCodes: [400, 409],
   *   },
   *   routeSecurity: [{ myTokenAuthorizer: [] }],
   * });
   *
   * @example
   * // GET /users/{id} — fetch a user by ID (no request body)
   * spec.addRoute({
   *   routeName: "/users/{id}",
   *   method: "get",
   *   summary: "Get a user by ID",
   *   requestInfo: {
   *     requestParameters: [
   *       { name: "id", type: "path", description: "The user's UUID", schema: z.string().uuid() },
   *     ],
   *   },
   *   responseInfo: {
   *     happyPathStatusCode: 200,
   *     description: "User found",
   *     contentType: "application/json",
   *     contentSchema: "User",
   *     additionalStatusCodes: [404],
   *   },
   * });
   */
  public addRoute(routeInfo: Prettify<AddRouteParams>): void {
    const {
      routeName,
      method,
      summary,
      requestInfo,
      responseInfo,
      responses = {},
      routeSecurity,
    } = routeInfo;

    const {
      requestValidator,
      contentSchema,
      contentType = "application/json",
      requestParameters = [],
    }: RequestInfo = requestInfo;

    if (this.paths[routeName]?.[method]) {
      throw new Error(`Method ${method} already exists for route ${routeName}`);
    }

    this.paths[routeName] = {
      ...this.paths[routeName],
      [method]: {
        summary,
        responses,
      },
    };

    this.addRequestValidator(routeName, method, requestValidator);

    this.addRequestBody({
      routeName,
      method,
      requestBodySchema: contentSchema,
      requestBodyContentType: contentType,
    });

    this.addResponseInfo({ routeName, method, responseInfo });

    this.addRequestParameters(routeName, method, requestParameters);

    this.addGatewayIntegration(routeName, method);

    this.addRouteSecurity(routeName, method, routeSecurity);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private addRequestValidator(
    routeName: string,
    method: string,
    requestValidator?: RequestValidationOptions,
  ): void {
    if (requestValidator) {
      this.paths![routeName]![method as keyof PathItem] = {
        ...this.paths[routeName]![method as keyof PathItem]!,
        "x-amazon-apigateway-request-validator": requestValidator,
      };
    }
  }

  private getSchemaObject(
    requestBodySchema: z.ZodType | string | JSONSchema,
  ): ZodJsonSchemaOmitted | { $ref: string } | JSONSchema {
    if (requestBodySchema instanceof z.ZodType) {
      const { $schema, ...rest } = z.toJSONSchema(requestBodySchema);
      return rest;
    }

    if (typeof requestBodySchema === "string") {
      return { $ref: `#/components/schemas/${requestBodySchema}` };
    }

    return requestBodySchema;
  }

  private addResponseInfo({
    routeName,
    method,
    responseInfo,
  }: {
    routeName: string;
    method: HttpMethod;
    responseInfo: ResponseInfo;
  }): void {
    const { contentSchema, contentType, happyPathStatusCode, description, additionalStatusCodes } =
      responseInfo;

    const rest = this.getSchemaObject(contentSchema);

    const responses: Record<string, ResponseObject> = {
      [`${happyPathStatusCode}`]: {
        description,
        content: {
          [contentType]: {
            schema: rest,
          },
        },
      },
    };

    additionalStatusCodes.forEach((statusCode) => {
      const description = {
        description: getReasonPhrase(statusCode),
      };

      responses[`${statusCode}`] = description;
    });

    responses["default"] = {
      description: getReasonPhrase(happyPathStatusCode),
    };

    this.paths![routeName]![method as keyof PathItem] = {
      ...this.paths[routeName]![method as keyof PathItem]!,
      responses,
    };
  }

  private addRequestBody({
    routeName,
    method,
    requestBodySchema,
    requestBodyContentType,
  }: {
    routeName: string;
    method: HttpMethod;
    requestBodySchema?: z.ZodObject | string | JSONSchema;
    requestBodyContentType: string;
  }): void {
    if (requestBodySchema) {
      const rest = this.getSchemaObject(requestBodySchema);

      this.paths![routeName]![method as keyof PathItem] = {
        ...this.paths[routeName]![method as keyof PathItem]!,
        requestBody: {
          required: true,
          content: {
            [requestBodyContentType]: {
              schema: rest,
            },
          },
        },
      };
    }
  }

  private addRequestParameters(
    routeName: string,
    method: HttpMethod,
    requestParameters: RequestParameter[],
  ): void {
    if (requestParameters.length > 0) {
      this.paths![routeName]![method as keyof PathItem] = {
        ...this.paths[routeName]![method as keyof PathItem]!,
        parameters: requestParameters.map(({ name, type, description, schema }) => {
          const rest = this.getSchemaObject(schema);

          return {
            name,
            in: type,
            required: true,
            description,
            schema: rest,
          };
        }),
      };
    }
  }

  private addGatewayIntegration(routeName: string, method: HttpMethod) {
    const formatedRouteName = routeName.replace(/^\//, "").replace(/[{}]/g, "").replace(/\//g, "_");

    this.paths[routeName]![method as keyof PathItem] = {
      ...this.paths[routeName]![method as keyof PathItem]!,
      "x-amazon-apigateway-integration": {
        type: "aws_proxy",
        httpMethod: "POST",
        uri: `\${${formatedRouteName}_${method}_lambda_invoke_arn}`,
        payloadFormatVersion: "2.0",
      },
    };
  }

  private addRouteSecurity(
    routeName: string,
    method: HttpMethod,
    security?: Record<string, string[]>[],
  ) {
    if (security?.length === 0) return;

    this.paths[routeName]![method as keyof PathItem] = {
      ...this.paths[routeName]![method as keyof PathItem]!,
      security,
    };
  }
}
