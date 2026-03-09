import { ZodStandardJSONSchemaPayload } from "zod/v4/core";
import { z } from "zod";

export enum RequestParameterType {
  QUERY = "query",
  PATH = "path",
}

type RequestParameterAcceptedSchemas =
  | z.ZodString
  | z.ZodNumber
  | z.ZodBoolean
  | z.ZodUUID
  | z.ZodEnum<any>;

export type RequestParameter = {
  name: string;
  type: RequestParameterType;
  required?: boolean;
  description: string;
  schema: RequestParameterAcceptedSchemas;
};

export type RouteRequestParameter = {
  name: string;
  in: RequestParameterType;
  required?: boolean;
  description: string;
  schema: Omit<ZodStandardJSONSchemaPayload<RequestParameterAcceptedSchemas>, "$schema">;
};
