type RequestValidatorObject = {
    validateRequestBody: boolean;
    validateRequestParameters: boolean;
}

export enum RequestValidationEnum {
    NONE = "none",
    STRICT = "strict",
    REQUEST_BODY_VALIDATION_ONLY = "request-body-only",
    REQUEST_PARAMETER_VALIDATION_ONLY = "request-parameter-only",
}

export type RequestValidators = {
    [RequestValidationEnum.NONE]: RequestValidatorObject
    [RequestValidationEnum.STRICT]: RequestValidatorObject
    [RequestValidationEnum.REQUEST_BODY_VALIDATION_ONLY]: RequestValidatorObject
    [RequestValidationEnum.REQUEST_PARAMETER_VALIDATION_ONLY]: RequestValidatorObject
}