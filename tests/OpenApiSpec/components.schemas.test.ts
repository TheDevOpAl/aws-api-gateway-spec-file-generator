import z from "zod";
import { OpenApiSpec } from "../../src";

describe("OpenApiSpec components.schemas", () => {
  let spec: OpenApiSpec;

  beforeEach(() => {
    spec = new OpenApiSpec();
  });

  it("should initialize with empty schemas", () => {
    const content = spec.getOpenApiSpecContent();
    expect(content.components.schemas).toEqual({});
  });

  it("should allow adding a schema that is a Zod object", () => {
    const schemaName = "User";
    const userSchema = z.object({
      name: z.string(),
      age: z.number().optional(),
    });

    spec.addSchema(schemaName, userSchema);

    const content = spec.getOpenApiSpecContent();

    expect(content.components.schemas).toEqual({
      User: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          age: {
            type: "number",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
    });
  });

  it("should allow adding a schema that is a Zod String", () => {
    const schemaName = "Username";
    const usernameSchema = z.string();

    spec.addSchema(schemaName, usernameSchema);

    const content = spec.getOpenApiSpecContent();

    expect(content.components.schemas).toEqual({
      Username: {
        type: "string",
      },
    });
  });

  it("Should allow adding two different schemas", () => {
    const userSchema = z.object({
      name: z.string(),
    });

    const productSchema = z.object({
      title: z.string(),
      price: z.number(),
    });

    spec.addSchema("User", userSchema);
    spec.addSchema("Product", productSchema);

    const content = spec.getOpenApiSpecContent();

    expect(content.components.schemas).toEqual({
      User: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
        required: ["name"],
        additionalProperties: false,
      },
      Product: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },
          price: {
            type: "number",
          },
        },
        required: ["title", "price"],
        additionalProperties: false,
      },
    });
  });
});
