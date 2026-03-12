import { _JSONSchema } from "zod/v4/core/json-schema.cjs";
import { HttpMethod, HttpMethodUpperCase } from "./HttpMethod";
import { RouteRequestParameter } from "./RequestParameter";
import { RequestValidationOptions } from "./RequestValidators";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";

type RequestBody = {
  required: true;
  content: {
    [key: string]: {
      schema:
        | ZodJsonSchemaOmitted
        | {
            $ref: string;
          }
        | _JSONSchema;
    };
  };
};

export type PathItem = {
  [key in HttpMethod]?: {
    summary: string;
    "x-amazon-apigateway-request-validator"?: RequestValidationOptions;
    "x-amazon-apigateway-integration": {
      httpMethod: HttpMethodUpperCase;
      payloadFormatVersion: "2.0";
      type: "aws_proxy";
      uri: string;
    };
    requestBody?: RequestBody;
    parameters?: RouteRequestParameter[];
  };
};
