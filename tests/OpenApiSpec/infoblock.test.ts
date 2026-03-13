import { OpenApiSpec } from "../../src/OpenApiSpec/openApiSpec";
describe("InfoBlock", () => {
  let spec: OpenApiSpec;

  beforeEach(() => {
    spec = new OpenApiSpec();
  });

  it("should set the info block correctly", () => {
    const infoBlockInput = {
      title: "Test API",
      version: "1.0.0",
      description: "This is a test API",
      contactName: "John Doe",
      contactEmail: "contact@example.com",
      contactUrl: "https://example.com/contact",
    };

    spec.setInfoBlock(infoBlockInput);

    expect(spec.getOpenApiSpecContent().info).toEqual({
      title: "Test API",
      version: "1.0.0",
      description: "This is a test API",
      contact: {
        name: "John Doe",
        email: "contact@example.com",
        url: "https://example.com/contact",
      },
    });
  });
});
