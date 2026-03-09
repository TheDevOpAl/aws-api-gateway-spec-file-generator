import { HttpMethod } from "./HttpMethod";
import { RequestValidationEnum } from "./RequestValidators";

export type PathItem = {
    [key in HttpMethod]?: {
        summary: string;
        "x-amazon-apigateway-request-validator"?: RequestValidationEnum;
    };
};