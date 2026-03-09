import { HttpMethod } from "./HttpMethod";
import { RequestValidationEnum } from "./RequestValidators";
import { z } from 'zod';

export type AddRouteParams = {
    routeName: string;
    method: HttpMethod;
    summary: string;
    requestValidator?: RequestValidationEnum;
    requestBodySchema?: z.ZodObject;
};