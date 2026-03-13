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
import { HttpMethod, HttpMethodUpperCase } from "../types/HttpMethod";
import { Server } from "../types/Server";
import { _JSONSchema } from "zod/v4/core/json-schema.cjs";
import { Security } from "../types/Security";
import { Prettify } from "../types/Prettify";
import { RequestInfo } from "../types/RequestInfo";
import { ResponseInfo } from "../types/ResponseInfo";
import { getReasonPhrase } from "http-status-codes";

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
  private servers: Server[] = [];

  public getOpenApiSpecContent(): SpecFileContent {
    const specContent: SpecFileContent = {
      openapi: this.openApi,
      paths: this.paths,
      info: this.info,
      servers: this.servers,
      components: {
        securitySchemes: this.securitySchemes,
        schemas: this.schemas,
      },
      "x-amazon-apigateway-request-validators": this.xAmazonApigatewayRequestValidators,
      "x-amazon-apigateway-request-validator": this.xAmazonApigatewayRequestValidator,
      security: this.security,
    };

    return specContent;
  }

  public setGlobalRequestValidator(requestValidator: RequestValidationOptions): void {
    this.xAmazonApigatewayRequestValidator = requestValidator;
  }

  public setServers(servers: Prettify<Server>[]) {
    this.servers = servers;
  }

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
    requestBodySchema: z.ZodType | string | _JSONSchema,
  ): ZodJsonSchemaOmitted | { $ref: string } | _JSONSchema {
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
        description: getReasonPhrase(statusCode)
      };

      responses[`${statusCode}`] = description;
    });

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
    requestBodySchema?: z.ZodObject | string | _JSONSchema;
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
    const methodUpper: HttpMethodUpperCase = method.toUpperCase() as HttpMethodUpperCase;

    this.paths[routeName]![method as keyof PathItem] = {
      ...this.paths[routeName]![method as keyof PathItem]!,
      "x-amazon-apigateway-integration": {
        type: "aws_proxy",
        httpMethod: methodUpper,
        uri: `\${${routeName}_${method}_invoke_arn}`,
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

  public addSecuritySchemeAuthorizer({
    securityName,
    authorizerType,
    authorizerUri,
    authorizerResultsCacheTtlInSeconds,
  }: Prettify<AwsAuthorizerScheme>): void {
    const authorizer: Authorizer = {
      type: "apiKey",
      name: "Authorization",
      in: "header",
      "x-amazon-apigateway-authtype": "custom",
      "x-amazon-apigateway-authorizer": {
        type: authorizerType,
        authorizerUri: authorizerUri ?? "${authorizer_lambda_arn}",
        "x-amazon-apigateway-results-cache-ttl-in-seconds": authorizerResultsCacheTtlInSeconds ?? 0,
      },
    };

    if (authorizerType === "token") {
      authorizer["x-amazon-apigateway-authorizer"].identitySource =
        "method.request.header.Authorization";
    }

    this.securitySchemes[securityName] = authorizer;
  }

  public setGlobalSecurity(security: Prettify<Security>[]) {
    this.security = security;
  }

  public addSchema(schemaName: string, schema: z.ZodType | _JSONSchema): void {
    const rest = this.getSchemaObject(schema);

    this.schemas[schemaName] = rest;
  }

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
}
