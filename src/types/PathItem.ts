import { JSONSchema } from "zod/v4/core/json-schema.cjs";
import { HttpMethod } from "./HttpMethod";
import { RouteRequestParameter } from "./RequestParameter";
import { RequestValidationOptions } from "./RequestValidators";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";
import { RefSchemaType } from "./RefSchemaType";

type Content = {
  [key: string]: {
    schema: ZodJsonSchemaOmitted | RefSchemaType | JSONSchema;
  };
};

type RequestBody = {
  required: true;
  content: Content;
};

export type ResponseObject = {
  description?: string;
  content?: Content;
  $ref?: string;
};

export type PathItem = {
  [key in HttpMethod]?: {
    summary: string;
    "x-amazon-apigateway-request-validator"?: RequestValidationOptions;
    security?: Record<string, string[]>[];
    "x-amazon-apigateway-integration": {
      httpMethod: "POST";
      payloadFormatVersion: "2.0";
      type: "aws_proxy";
      uri: string;
    };
    requestBody?: RequestBody;
    responses: Record<string, ResponseObject>;
    parameters?: RouteRequestParameter[];
  };
};
