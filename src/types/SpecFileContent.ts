import { SecurityScheme } from "./AwsAuthorizerSheme";
import { InfoBlockOutput } from "./InfoBlock";
import { PathItem } from "./PathItem";
import { RequestValidationEnum, RequestValidators } from "./RequestValidators";
import { Schemas } from "./Schemas";

export type SpecFileContent = {
  openapi: string;
  paths: Record<string, PathItem>;
  info: InfoBlockOutput;
  components: {
    securitySchemes: SecurityScheme;
    schemas: Schemas;
  };
  "x-amazon-apigateway-request-validators"?: RequestValidators;
  "x-amazon-apigateway-request-validator": RequestValidationEnum;
  security: Record<string, string[]>[];
};
