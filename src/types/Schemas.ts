import { JSONSchema } from "zod/v4/core/json-schema.cjs";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";

export type Schemas = {
  [key: string]: ZodJsonSchemaOmitted | JSONSchema;
};
