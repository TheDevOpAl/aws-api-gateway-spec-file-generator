import { z } from "zod";
import { RefSchemaType } from "./RefSchemaType";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";
import { _JSONSchema } from "zod/v4/core/json-schema.cjs";

export type RequestParameterType = "query" | "path";

export type RequestParameter = {
  name: string;
  type: RequestParameterType;
  description: string;
  schema: z.ZodType | string | _JSONSchema;
};

export type RouteRequestParameter = {
  name: string;
  in: RequestParameterType;
  required: true;
  description: string;
  schema: ZodJsonSchemaOmitted | RefSchemaType | _JSONSchema;
};
