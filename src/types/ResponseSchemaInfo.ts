import z from "zod";
import { JSONSchema } from "zod/v4/core/json-schema.cjs";

export type ResponseSchemaInfo = {
  schemaName: string;
  schema?: z.ZodType | JSONSchema | string;
  description?: string;
  mediaType?: string;
};
