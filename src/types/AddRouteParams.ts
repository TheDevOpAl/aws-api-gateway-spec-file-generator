import { HttpMethod } from "./HttpMethod";
import { RequestParameter } from "./RequestParameter";
import { RequestValidationOptions } from "./RequestValidators";
import { z } from "zod";

export type AddRouteParams = {
  routeName: string;
  method: HttpMethod;
  summary: string;
  requestValidator?: RequestValidationOptions;
  requestBodySchema?: z.ZodObject | string;
  requestBodyContentType?: string;
  responses?: {};
  requestParameters?: RequestParameter[];
};
