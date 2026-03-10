import { ZodStandardJSONSchemaPayload } from "zod/v4/core";
import { HttpMethod } from "./HttpMethod";
import { RequestValidationEnum } from "./RequestValidators";
import { z } from "zod";
import { RouteRequestParameter } from "./RequestParameter";

type RequestBody = {
  required: true;
  content: {
    [key: string]: {
      schema: Omit<ZodStandardJSONSchemaPayload<z.ZodObject>, "$schema">;
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
