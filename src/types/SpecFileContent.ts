import { SecurityScheme } from "./AwsAuthorizerSheme";
import { CORS } from "./CORS";
import { InfoBlockOutput } from "./InfoBlock";
import { PathItem, ResponseObject } from "./PathItem";
import { RequestValidationOptions, RequestValidators } from "./RequestValidators";
import { Schemas } from "./Schemas";
import { Security } from "./Security";
import { Server } from "./Server";
import { Tag } from "./Tag";
import { ValidationErrorOptions } from "./ValidationErrorOptions";

export type SpecFileContent = {
  openapi: string;
  paths: Record<string, PathItem>;
  info: InfoBlockOutput;
  tags: Tag[];
  components: {
    securitySchemes: SecurityScheme;
    schemas: Schemas;
    responses: Record<string, ResponseObject>;
  };
  "x-amazon-apigateway-request-validators"?: RequestValidators;
  "x-amazon-apigateway-request-validator": RequestValidationOptions;
  "x-amazon-apigateway-gateway-responses"?: Record<string, ValidationErrorOptions>;
  security: Security[];
  servers: Server[];
  "x-amazon-apigateway-cors"?: CORS;
  "x-amazon-apigateway-binary-media-types"?: string[];
};
