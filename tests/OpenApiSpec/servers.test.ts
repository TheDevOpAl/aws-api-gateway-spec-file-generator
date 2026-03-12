import { OpenApiSpec } from "../../src";

describe("Set Servers", () => {
  it("Should add servers", () => {
    const spec = new OpenApiSpec();

    spec.setServers([
      {
        url: "https://www.url.com",
        description: "Fake url",
      },
    ]);

    const content = spec.getOpenApiSpecContent();

    expect(content.servers).toEqual([
      {
        url: "https://www.url.com",
        description: "Fake url",
      },
    ]);
  });
});
