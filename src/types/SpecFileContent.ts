import { PathItem } from "./PathItem";
import { RequestValidators } from "./RequestValidators";

export type SpecFileContent = {
    openapi: string;
    paths: Record<string, PathItem>;
    components: any;
    securitySchemes: any;
    "x-amazon-apigateway-request-validators"?: RequestValidators;
}