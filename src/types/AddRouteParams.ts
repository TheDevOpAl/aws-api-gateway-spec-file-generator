import { HttpMethod } from "./HttpMethod";
import { RequestValidationEnum } from "./RequestValidators";

export type AddRouteParams = {
    routeName: string;
    method: HttpMethod;
    summary: string;
    requestValidator?: RequestValidationEnum;
};