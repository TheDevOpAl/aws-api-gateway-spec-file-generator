type RequestValidatorObject = {
  validateRequestBody: boolean;
  validateRequestParameters: boolean;
};

type none = "none";
type strict = "strict";
type requestBodyOnly = "request-body-only";
type requestParameterOnly = "request-parameter-only";

export type RequestValidationOptions = none | strict | requestBodyOnly | requestParameterOnly;

export type RequestValidators = {
  none: RequestValidatorObject;
  strict: RequestValidatorObject;
  "request-body-only": RequestValidatorObject;
  "request-parameter-only": RequestValidatorObject;
};
