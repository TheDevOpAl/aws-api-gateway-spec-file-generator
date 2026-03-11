import { OpenApiSpec } from "../../src/OpenApiSpec/openApiSpec";

describe("OpenApiSpec Request Validation", () => {
  let spec: OpenApiSpec;

  beforeEach(() => {
    spec = new OpenApiSpec();
  });

  it("should give a basic request validator with no validation", () => {
    spec.setGlobalRequestValidator("none");
    const content = spec.getOpenApiSpecContent();
    expect(content["x-amazon-apigateway-request-validator"]).toEqual("none");
  });

  it("should give a basic request validator with strict validation", () => {
    spec.setGlobalRequestValidator("strict");
    const content = spec.getOpenApiSpecContent();
    expect(content["x-amazon-apigateway-request-validator"]).toEqual("strict");
  });

  it("should give a basic request validator with request body validation only", () => {
    spec.setGlobalRequestValidator("request-body-only");
    const content = spec.getOpenApiSpecContent();
    expect(content["x-amazon-apigateway-request-validator"]).toEqual("request-body-only");
  });

  it("should give a basic request validator with request parameter validation only", () => {
    spec.setGlobalRequestValidator("request-parameter-only");
    const content = spec.getOpenApiSpecContent();
    expect(content["x-amazon-apigateway-request-validator"]).toEqual("request-parameter-only");
  });
});
