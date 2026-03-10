import { PathItem } from "./PathItem";
import { RequestValidationEnum, RequestValidators } from "./RequestValidators";

export type SpecFileContent = {
  openapi: string;
  paths: Record<string, PathItem>;
  info: string;
  components: any;
  "x-amazon-apigateway-request-validators"?: RequestValidators;
  "x-amazon-apigateway-request-validator": RequestValidationEnum;
  security: Record<string, string[]>[];
};
