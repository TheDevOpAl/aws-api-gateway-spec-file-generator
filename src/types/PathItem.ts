import { HttpMethod } from "./HttpMethod";
import { RequestValidationEnum } from "./RequestValidators";
import { RouteRequestParameter } from "./RequestParameter";
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
    "x-amazon-apigateway-request-validator"?: RequestValidationEnum;
    requestBody?: RequestBody;
    parameters?: RouteRequestParameter[];
  };
};
