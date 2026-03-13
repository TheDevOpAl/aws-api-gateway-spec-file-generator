import { _JSONSchema } from "zod/v4/core/json-schema.cjs";
import { HttpMethod, HttpMethodUpperCase } from "./HttpMethod";
import { RouteRequestParameter } from "./RequestParameter";
import { RequestValidationOptions } from "./RequestValidators";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";

type Content = {
  [key: string]: {
    schema:
      | ZodJsonSchemaOmitted
      | {
          $ref: string;
        }
      | _JSONSchema;
  };
}

type RequestBody = {
  required: true;
  content: Content
};

type ResponseObject = {
  [key: string]: {
    description: string;
    content: Content;
  }
}

export type PathItem = {
  [key in HttpMethod]?: {
    summary: string;
    "x-amazon-apigateway-request-validator"?: RequestValidationOptions;
    security?: Record<string, string[]>[];
    "x-amazon-apigateway-integration": {
      httpMethod: HttpMethodUpperCase;
      payloadFormatVersion: "2.0";
      type: "aws_proxy";
      uri: string;
    };
    requestBody?: RequestBody;
    responses: ResponseObject
    parameters?: RouteRequestParameter[];
  };
};
