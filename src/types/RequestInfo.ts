import z from "zod";
import { JSONSchema } from "zod/v4/core/json-schema.cjs";
import { RequestValidationOptions } from "./RequestValidators";
import { RequestParameter } from "./RequestParameter";
import { MediaType } from "./MediaTypes";

export type RequestInfo = {
  contentType?: MediaType;
  contentSchema?: z.ZodObject | string | JSONSchema;
  requestValidator?: RequestValidationOptions;
  requestParameters?: RequestParameter[];
};
