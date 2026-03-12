import { HttpMethod } from "./HttpMethod";
import { RequestParameter } from "./RequestParameter";
import { RequestValidationOptions } from "./RequestValidators";
import { z } from "zod";
import { _JSONSchema } from "zod/v4/core/json-schema.cjs";
import { Security } from "./Security";

export type AddRouteParams = {
  routeName: string;
  method: HttpMethod;
  summary: string;
  requestValidator?: RequestValidationOptions;
  requestBodySchema?: z.ZodObject | string | _JSONSchema;
  requestBodyContentType?: string;
  responses?: {};
  requestParameters?: RequestParameter[];
  routeSecurity?: Security[];
};
