import z from "zod";
import { HttpStatusCodes } from "./HttpStatusCodes";
import { JSONSchema } from "zod/v4/core/json-schema.cjs";

export type AdditionalResponses = {
  statusCode: HttpStatusCodes;
  description?: string;
  contentType?: string;
  contentSchema?: z.ZodObject | string | JSONSchema;
  refType?: "schema" | "response";
};
