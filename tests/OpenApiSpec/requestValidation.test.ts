import { RequestValidationEnum } from "../../src/types/RequestValidators";
import { OpenApiSpec } from "../../src/OpenApiSpec/openApiSpec";

describe("OpenApiSpec Request Validation", () => {
    let spec: OpenApiSpec;

    beforeEach(() => {
        spec = new OpenApiSpec();
    });

    it("should give a basic request validator with no validation", () => {
        spec.setGlobalRequestValidator(RequestValidationEnum.NONE);
        const content = spec.getOpenApiSpecContent();
        expect(content["x-amazon-apigateway-request-validator"]).toEqual("none");
    });

    it("should give a basic request validator with strict validation", () => {
        spec.setGlobalRequestValidator(RequestValidationEnum.STRICT);
        const content = spec.getOpenApiSpecContent();
        expect(content["x-amazon-apigateway-request-validator"]).toEqual("strict");
    });

    it("should give a basic request validator with request body validation only", () => {
        spec.setGlobalRequestValidator(RequestValidationEnum.REQUEST_BODY_VALIDATION_ONLY);
        const content = spec.getOpenApiSpecContent();
        expect(content["x-amazon-apigateway-request-validator"]).toEqual("request-body-only");
    });

    it("should give a basic request validator with request parameter validation only", () => {
        spec.setGlobalRequestValidator(RequestValidationEnum.REQUEST_PARAMETER_VALIDATION_ONLY);
        const content = spec.getOpenApiSpecContent();
        expect(content["x-amazon-apigateway-request-validator"]).toEqual("request-parameter-only");
    });
});