import { z } from "zod";
import { AddRouteParams } from "../types/AddRouteParams";
import { PathItem } from "../types/PathItem";
import { RequestValidationEnum, RequestValidators } from "../types/RequestValidators";
import { SpecFileContent } from "../types/SpecFileContent";
import { RequestParameter } from "../types/RequestParameter";

export class OpenApiSpec {
  private openApi: string = "3.0.1";
  private paths: Record<string, PathItem> = {};
  private components: any = {};
  private securitySchemes: any = {};
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
      components: this.components,
      securitySchemes: this.securitySchemes,
      "x-amazon-apigateway-request-validators": this.xAmazonApigatewayRequestValidators,
      "x-amazon-apigateway-request-validator": this.xAmazonApigatewayRequestValidator,
    };

    return specContent;
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

  private addRequestBody(routeName: string, method: string, requestBodySchema?: z.ZodObject): void {
    if (requestBodySchema) {
      const { $schema, ...rest } = z.toJSONSchema(requestBodySchema);

      this.paths![routeName]![method as keyof PathItem] = {
        ...this.paths[routeName]![method as keyof PathItem]!,
        requestBody: rest,
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
            const { $schema, ...rest } = z.toJSONSchema(schema);

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

  public addRoute({
    routeName,
    method,
    summary,
    requestValidator,
    requestBodySchema,
    requestParameters = [],
  }: AddRouteParams): void {
    if (this.paths[routeName]?.[method]) {
      throw new Error(`Method ${method} already exists for route ${routeName}`);
    }

    this.paths[routeName] = {
      ...this.paths[routeName],
      [method]: {
        summary,
      },
    };

    this.addRequestValidator(routeName, method, requestValidator);

    this.addRequestBody(routeName, method, requestBodySchema);

    this.addRequestParameters(routeName, method, requestParameters);
  }
}
