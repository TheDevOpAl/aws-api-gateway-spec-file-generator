import { SecurityScheme } from "./AwsAuthorizerSheme";
import { InfoBlockOutput } from "./InfoBlock";
import { PathItem } from "./PathItem";
import { RequestValidationOptions, RequestValidators } from "./RequestValidators";
import { Schemas } from "./Schemas";
import { Security } from "./Security";
import { Server } from "./Server";
import { ValidationErrorOptions } from "./ValidationErrorOptions";

export type SpecFileContent = {
  openapi: string;
  paths: Record<string, PathItem>;
  info: InfoBlockOutput;
  components: {
    securitySchemes: SecurityScheme;
    schemas: Schemas;
  };
  "x-amazon-apigateway-request-validators"?: RequestValidators;
  "x-amazon-apigateway-request-validator": RequestValidationOptions;
  "x-amazon-apigateway-gateway-responses"?: Record<string, ValidationErrorOptions>;
  security: Security[];
  servers: Server[];
};
