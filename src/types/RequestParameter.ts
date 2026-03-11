import { z } from "zod";
import { RefSchemaType } from "./RefSchemaType";
import { ZodJsonSchemaOmitted } from "./ZodJsonSchemaOmitted";

export enum RequestParameterType {
  QUERY = "query",
  PATH = "path",
}

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
