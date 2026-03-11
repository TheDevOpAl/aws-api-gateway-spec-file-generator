import { SecurityScheme } from "./AwsAuthorizerSheme";
import { PathItem } from "./PathItem";
import { RequestValidationEnum, RequestValidators } from "./RequestValidators";
import { Schemas } from "./Schemas";

export type SpecFileContent = {
  openapi: string;
  paths: Record<string, PathItem>;
  info: string;
  components: {
    securitySchemes: SecurityScheme;
    schemas: Schemas;
  };
  "x-amazon-apigateway-request-validators"?: RequestValidators;
  "x-amazon-apigateway-request-validator": RequestValidationEnum;
  security: Record<string, string[]>[];
};
