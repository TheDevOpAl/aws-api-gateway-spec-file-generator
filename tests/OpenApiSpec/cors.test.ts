import { OpenApiSpec } from "../../src/index";
import { CORS } from "../../src/types/CORS";

describe("Set CORS Policy", () => {
  it("Should set a CORS Policy", () => {
    const spec = new OpenApiSpec();

    const cors: CORS = {
      allowOrigins: ["https://www.example.com"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["content-type", "x-amz-date", "x-apigateway-header"],
      allowCredentials: true,
      exposeHeaders: ["x-apigateway-header", "x-amz-date", "content-type"],
      maxAge: 3600,
    };

    spec.setCORS(cors);
    const result = spec.getOpenApiSpecContent();
    expect(result["x-amazon-apigateway-cors"]).toEqual(cors);
  });
});
