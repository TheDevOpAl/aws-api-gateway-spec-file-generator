import { z } from "zod";
import { ZodStandardJSONSchemaPayload } from "zod/v4/core";

export type ZodJsonSchemaOmitted = Omit<ZodStandardJSONSchemaPayload<z.ZodType>, "$schema">;
