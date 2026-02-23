import { OpenApiSpec } from "../../src/index";

describe("OpenApiSpec openApi version", () => {
  let spec: OpenApiSpec;

  beforeEach(() => {
    spec = new OpenApiSpec();
  });

  it("should initialize with default OpenAPI version 3.0.1", () => {
    // Note: You may need to make the openApi property public or add a getter to test this

    const content = spec.getOpenApiSpecContent();
    expect(content.openapi).toEqual("3.0.1");
  });

  it("should allow setting OpenAPI version", () => {
    const version = "3.1.0";

    spec.setOpenApiVersion(version);
    // Note: You may need to add a getter to verify this
    const content = spec.getOpenApiSpecContent();
    expect(content.openapi).toEqual(version);
  });
});
