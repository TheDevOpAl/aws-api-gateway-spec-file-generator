import { HttpMethod } from "./HttpMethod";
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
          };
    };
  };
};

export type PathItem = {
  [key in HttpMethod]?: {
    summary: string;
    "x-amazon-apigateway-request-validator"?: RequestValidationOptions;
    requestBody?: RequestBody;
    parameters?: RouteRequestParameter[];
  };
};
