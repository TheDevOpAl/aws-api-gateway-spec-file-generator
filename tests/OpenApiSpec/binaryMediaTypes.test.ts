import { OpenApiSpec } from "../../src";

describe("Binary Media Types", () => {
  it("should render the extension when existing", () => {
    const mediaTypes = ["image/jpeg", "application/octet"];
    const spec = new OpenApiSpec();

    spec.setBinaryMediaTypes(mediaTypes);

    const result = spec.getOpenApiSpecContent();
    expect(result["x-amazon-apigateway-binary-media-types"]).toBe(mediaTypes);
  });
});
