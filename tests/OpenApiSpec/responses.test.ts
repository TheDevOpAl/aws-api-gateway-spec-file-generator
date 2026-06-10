import z from "zod";
import { OpenApiSpec } from "../../src";

describe("Add responses to OpenApiSpec", () => {
  it("should add responses to the OpenApiSpec content", () => {
    const spec = new OpenApiSpec();
    spec.addComponentResponse({
      schemaName: "NotFound",
      description: "Resource not found",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
          },
        },
        required: ["message"],
      },
    });

    spec.addComponentResponse({
      schemaName: "Conflict",
      description: "Conflict occurred",
      schema: z.object({
        conflictingId: z.string(),
      }),
    });

    spec.addComponentResponse({
      schemaName: "Unauthorized",
      description: "Authentication required",
      schema: "ErrorBody",
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
      info: {
        title: "",
        version: "",
        description: "",
        contact: {
          url: "",
          name: "",
          email: "",
        },
      },
      tags: [],
      servers: [],
      components: {
        securitySchemes: {},
        schemas: {},
        responses: {
          NotFound: {
            description: "Resource not found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                    },
                  },
                  required: ["message"],
                },
              },
            },
          },
          Conflict: {
            description: "Conflict occurred",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    conflictingId: {
                      type: "string",
                    },
                  },
                  required: ["conflictingId"],
                  additionalProperties: false,
                },
              },
            },
          },
          Unauthorized: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorBody",
                },
              },
            },
          },
        },
      },
      "x-amazon-apigateway-request-validators": {
        none: {
          validateRequestBody: false,
          validateRequestParameters: false,
        },
        strict: {
          validateRequestBody: true,
          validateRequestParameters: true,
        },
        "request-body-only": {
          validateRequestBody: true,
          validateRequestParameters: false,
        },
        "request-parameter-only": {
          validateRequestBody: false,
          validateRequestParameters: true,
        },
      },
      "x-amazon-apigateway-request-validator": "none",
      "x-amazon-apigateway-gateway-responses": {
        BAD_REQUEST_BODY: {
          statusCode: 400,
          responseTemplates: {
            "application/json":
              '{"message":"$context.error.validationErrorString","error":"BAD_REQUEST_BODY"}',
          },
          responseParameters: {
            "gatewayresponse.header.Content-Type": "'application/json'",
          },
        },
        BAD_REQUEST_PARAMETERS: {
          statusCode: 400,
          responseTemplates: {
            "application/json":
              '{"message":"$context.error.validationErrorString","error":"BAD_REQUEST_PARAMETERS"}',
          },
          responseParameters: {
            "gatewayresponse.header.Content-Type": "'application/json'",
          },
        },
      },
      security: [],
    });
  });
});
