import { ZodStandardJSONSchemaPayload } from "zod/v4/core";
import { HttpMethod } from "./HttpMethod";
import { RequestValidationEnum } from "./RequestValidators";
import { z } from "zod";

export type PathItem = {
  [key in HttpMethod]?: {
    summary: string;
    "x-amazon-apigateway-request-validator"?: RequestValidationEnum;
    requestBody?: Omit<ZodStandardJSONSchemaPayload<z.ZodObject>, "$schema">;
  };
};
