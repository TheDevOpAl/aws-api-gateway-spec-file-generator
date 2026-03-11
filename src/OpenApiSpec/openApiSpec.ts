import { z } from "zod";
import { AddRouteParams } from "../types/AddRouteParams";
import { PathItem } from "../types/PathItem";
import { RequestValidationEnum, RequestValidators } from "../types/RequestValidators";
import { SpecFileContent } from "../types/SpecFileContent";
import { RequestParameter } from "../types/RequestParameter";
import {
  Authorizer,
  AuthorizerTypeEnum,
  AwsAuthorizerScheme,
  SecurityScheme,
} from "../types/AwsAuthorizerSheme";
import { ZodJsonSchemaOmitted } from "../types/ZodJsonSchemaOmitted";
import { Schemas } from "../types/Schemas";

export class OpenApiSpec {
  private openApi: string = "3.0.1";
  private paths: Record<string, PathItem> = {};
  private securitySchemes: SecurityScheme = {};
  private info: string = "basic info";
  private security: Record<string, string[]>[] = [];
  private schemas: Schemas = {};
  private xAmazonApigatewayRequestValidators: RequestValidators = {
    [RequestValidationEnum.NONE]: {
      validateRequestBody: false,
      validateRequestParameters: false,
    },
    [RequestValidationEnum.STRICT]: {
      validateRequestBody: true,
      validateRequestParameters: true,
    },
    [RequestValidationEnum.REQUEST_BODY_VALIDATION_ONLY]: {
      validateRequestBody: true,
      validateRequestParameters: false,
    },
    [RequestValidationEnum.REQUEST_PARAMETER_VALIDATION_ONLY]: {
      validateRequestBody: false,
      validateRequestParameters: true,
    },
  };
  private xAmazonApigatewayRequestValidator: RequestValidationEnum = RequestValidationEnum.NONE;

  public getOpenApiSpecContent(): SpecFileContent {
    const specContent: SpecFileContent = {
      openapi: this.openApi,
      paths: this.paths,
      info: this.info,
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

  public setRouteInfo(info: string): void {
    this.info = info;
  }

  public setGlobalRequestValidator(requestValidator: RequestValidationEnum): void {
    this.xAmazonApigatewayRequestValidator = requestValidator;
  }

  public setOpenApiVersion(version: string): void {
    this.openApi = version;
  }

  private addRequestValidator(
    routeName: string,
    method: string,
    requestValidator?: RequestValidationEnum,
  ): void {
    if (requestValidator) {
      this.paths![routeName]![method as keyof PathItem] = {
        ...this.paths[routeName]![method as keyof PathItem]!,
        "x-amazon-apigateway-request-validator": requestValidator,
      };
    }
  }

  private getSchemaObject(
    requestBodySchema: z.ZodType | string,
  ): ZodJsonSchemaOmitted | { $ref: string } {
    if (requestBodySchema instanceof z.ZodType) {
      const { $schema, ...rest } = z.toJSONSchema(requestBodySchema);
      return rest;
    }
    return { $ref: `#/components/schemas/${requestBodySchema}` };
  }

  private addRequestBody({
    routeName,
    method,
    requestBodySchema,
    requestBodyContentType,
  }: {
    routeName: string;
    method: string;
    requestBodySchema?: z.ZodObject | string;
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
    method: string,
    requestParameters: RequestParameter[],
  ): void {
    if (requestParameters.length > 0) {
      this.paths![routeName]![method as keyof PathItem] = {
        ...this.paths[routeName]![method as keyof PathItem]!,
        parameters: requestParameters.map(
          ({ name, type, required = false, description, schema }) => {
            const rest = this.getSchemaObject(schema);

            return {
              name,
              in: type,
              required,
              description,
              schema: rest,
            };
          },
        ),
      };
    }
  }

  public addSecuritySchemeAuthorizer({
    securityName,
    authorizerType,
    authorizerUri,
    authorizerResultsCacheTtlInSeconds,
  }: AwsAuthorizerScheme): void {
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

    if (authorizerType === AuthorizerTypeEnum.TOKEN) {
      authorizer["x-amazon-apigateway-authorizer"].identitySource =
        "method.request.header.Authorization";
    }

    this.securitySchemes[securityName] = authorizer;

    this.security.push({
      [securityName]: [],
    });
  }

  public addRoute({
    routeName,
    method,
    summary,
    requestValidator,
    requestBodySchema,
    requestBodyContentType = "application/json",
    responses = {},
    requestParameters = [],
  }: AddRouteParams): void {
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

    this.addRequestBody({ routeName, method, requestBodySchema, requestBodyContentType });

    this.addRequestParameters(routeName, method, requestParameters);
  }
}
