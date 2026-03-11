import { z } from "zod";
import { RefSchemaType } from "./RefSchemaType";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";

export type RequestParameterType = "query" | "path";

export type RequestParameter = {
  name: string;
  type: RequestParameterType;
  required?: boolean;
  description: string;
  schema: z.ZodType | string;
};

export type RouteRequestParameter = {
  name: string;
  in: RequestParameterType;
  required?: boolean;
  description: string;
  schema: ZodJsonSchemaOmitted | RefSchemaType;
};
