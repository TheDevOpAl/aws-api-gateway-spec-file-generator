import { AddRouteParams } from "../types/AddRouteParams";
import { PathItem } from "../types/PathItem";
import { RequestValidationEnum, RequestValidators } from "../types/RequestValidators";
import { SpecFileContent } from "../types/SpecFileContent";

export class OpenApiSpec {
    private openApi: string = "3.0.1";
    private paths: Record<string, PathItem> = {};
    private components: any = {};
    private securitySchemes: any = {};
    private xAmazonApigatewayRequestValidators: RequestValidators = {
        [RequestValidationEnum.NONE]: { validateRequestBody: false, validateRequestParameters: false },
        [RequestValidationEnum.STRICT]: { validateRequestBody: true, validateRequestParameters: true },
        [RequestValidationEnum.REQUEST_BODY_VALIDATION_ONLY]: { validateRequestBody: true, validateRequestParameters: false },
        [RequestValidationEnum.REQUEST_PARAMETER_VALIDATION_ONLY]: { validateRequestBody: false, validateRequestParameters: true }
    };
    private xAmazonApigatewayRequestValidator: RequestValidationEnum = RequestValidationEnum.NONE;

    public getOpenApiSpecContent(): SpecFileContent {
        const specContent: SpecFileContent = {
            openapi: this.openApi,
            paths: this.paths,
            components: this.components,
            securitySchemes: this.securitySchemes,
            "x-amazon-apigateway-request-validators": this.xAmazonApigatewayRequestValidators,
            "x-amazon-apigateway-request-validator": this.xAmazonApigatewayRequestValidator
        }

        return specContent
    }

    public setGlobalRequestValidator(requestValidator: RequestValidationEnum): void {
        this.xAmazonApigatewayRequestValidator = requestValidator;
    }

    public setOpenApiVersion(version: string): void {
        this.openApi = version;
    }

    public addRoute({routeName, method, summary, requestValidator}: AddRouteParams): void {

        if (this.paths[routeName]?.[method]) {
            throw new Error(`Method ${method} already exists for route ${routeName}`);
        }

        this.paths[routeName] = {
            ...this.paths[routeName],
            [method]: {
                summary
            }
        };

        if (requestValidator) {
            this.paths![routeName]![method] = {
                ...this.paths[routeName]![method]!,
                "x-amazon-apigateway-request-validator": requestValidator
            }
        };
    }
}