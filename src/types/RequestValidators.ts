export type RequestValidators = {
    [key: string]: {
        validateRequestBody: boolean;
        validateRequestParameters: boolean;
    }
}