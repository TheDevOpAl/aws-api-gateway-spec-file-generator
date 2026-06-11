import z from "zod";
import { HttpStatusCodes } from "./HttpStatusCodes";
import { JSONSchema } from "zod/v4/core/json-schema.cjs";
import { MediaType } from "./MediaTypes";

export type AdditionalResponses = {
  statusCode: HttpStatusCodes;
  description?: string;
  contentType?: MediaType;
  contentSchema?: z.ZodObject | string | JSONSchema;
};
