import { AddRouteParams } from "../types/AddRouteParams";
import { PathItem } from "../types/PathItem";
import { RequestValidators } from "../types/RequestValidators";
import { SpecFileContent } from "../types/SpecFileContent";

export class OpenApiSpec {
    private openApi: string = "3.0.1";
    private paths: Record<string, PathItem> = {};
    private components: any = {};
    private securitySchemes: any = {};
    private "x-amazon-apigateway-request-validators": RequestValidators = {}

    public getOpenApiSpecContent(): SpecFileContent {

        const specContent: SpecFileContent = {
            openapi: this.openApi,
            paths: this.paths,
            components: this.components,
            securitySchemes: this.securitySchemes
        }

        if (this["x-amazon-apigateway-request-validators"]) {
            specContent["x-amazon-apigateway-request-validators"] = this["x-amazon-apigateway-request-validators"];
        }

        return specContent
    }

    public setRequestBodyValidation(requestValidationKey: string): void {
        if (!this["x-amazon-apigateway-request-validators"][requestValidationKey]) {
            this["x-amazon-apigateway-request-validators"][requestValidationKey] = {
                validateRequestBody: false,
                validateRequestParameters: false
            }
        }

        this["x-amazon-apigateway-request-validators"][requestValidationKey].validateRequestBody = true;
    }

    public setRequestParameterValidation(requestValidationKey: string): void {
        if (!this["x-amazon-apigateway-request-validators"][requestValidationKey]) {
            this["x-amazon-apigateway-request-validators"][requestValidationKey] = {
                validateRequestBody: false,
                validateRequestParameters: false
            }
        }
        this["x-amazon-apigateway-request-validators"][requestValidationKey].validateRequestParameters = true;
    }

    setOpenApiVersion(version: string): void {
        this.openApi = version;
    }

    addRoute({routeName, method, summary}: AddRouteParams): void {

        if (this.paths[routeName]?.[method]) {
            throw new Error(`Method ${method} already exists for route ${routeName}`);
        }

        this.paths[routeName] = {
            ...this.paths[routeName],
            [method]: {
                summary
            }
        };
    }
}