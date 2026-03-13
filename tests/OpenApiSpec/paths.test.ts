import { z } from "zod";
import { OpenApiSpec, AddRouteParams } from "../../src/index";

describe("OpenApiSpec paths", () => {
  let spec: OpenApiSpec;

  beforeEach(() => {
    spec = new OpenApiSpec();
  });

  it("should initialize with empty paths", () => {
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({});
  });

  it("should allow setting paths with a get request", () => {
    const path: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
      requestInfo: {},
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      users: {
        get: {
          summary: "Get all users",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "GET",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users_get_invoke_arn}",
          },
        },
      },
    });
  });

  it("should allow setting paths with a post request and get request", () => {
    const path1: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
      requestInfo: {},
    };
    const path2: AddRouteParams = {
      routeName: "users",
      method: "post",
      summary: "Create a post",
      requestInfo: {},
    };
    spec.addRoute(path1);
    spec.addRoute(path2);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      users: {
        get: {
          summary: "Get all users",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "GET",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users_get_invoke_arn}",
          },
        },
        post: {
          summary: "Create a post",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "POST",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users_post_invoke_arn}",
          },
        },
      },
    });
  });

  it("should allow setting paths with multiple routes", () => {
    const path1: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
      requestInfo: {},
    };
    const path2: AddRouteParams = {
      routeName: "products",
      method: "post",
      summary: "Create a product",
      requestInfo: {},
    };
    spec.addRoute(path1);
    spec.addRoute(path2);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      users: {
        get: {
          summary: "Get all users",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "GET",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users_get_invoke_arn}",
          },
        },
      },
      products: {
        post: {
          summary: "Create a product",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "POST",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${products_post_invoke_arn}",
          },
        },
      },
    });
  });

  it("Throw error if method already exists for a route", () => {
    const path1: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
      requestInfo: {},
    };
    const path2: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users again",
      requestInfo: {},
    };
    spec.addRoute(path1);
    expect(() => spec.addRoute(path2)).toThrow("Method get already exists for route users");
  });

  it("Should allow for path parameters", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "get",
      summary: "Get user by ID",
      requestInfo: {},
    };
    const path2: AddRouteParams = {
      routeName: "users/{userId}",
      method: "post",
      summary: "Create a user by ID",
      requestInfo: {},
    };
    const path3: AddRouteParams = {
      routeName: "users",
      method: "post",
      summary: "Create a new User",
      requestInfo: {},
    };

    spec.addRoute(path);
    spec.addRoute(path2);
    spec.addRoute(path3);

    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      "users/{userId}": {
        get: {
          summary: "Get user by ID",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "GET",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users/{userId}_get_invoke_arn}",
          },
        },
        post: {
          summary: "Create a user by ID",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "POST",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users/{userId}_post_invoke_arn}",
          },
        },
      },
      users: {
        post: {
          summary: "Create a new User",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "POST",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users_post_invoke_arn}",
          },
        },
      },
    });
  });

  it("Should add request validation to a route if provided", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "get",
      summary: "Get user by ID",
      requestInfo: {
        requestValidator: "strict",
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      "users/{userId}": {
        get: {
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "GET",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users/{userId}_get_invoke_arn}",
          },
          summary: "Get user by ID",
          "x-amazon-apigateway-request-validator": "strict",
        },
      },
    });
  });

  it("Should add a requestBody to a route if provided", () => {
    const myZodObj = z.object({
      name: z.string(),
      age: z.number().optional(),
    });
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "post",
      summary: "Create user",
      requestInfo: {
        requestValidator: "strict",
        contentSchema: myZodObj,
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      "users/{userId}": {
        post: {
          summary: "Create user",
          "x-amazon-apigateway-request-validator": "strict",
          responses: {},
          "x-amazon-apigateway-integration": {
            httpMethod: "POST",
            payloadFormatVersion: "2.0",
            type: "aws_proxy",
            uri: "${users/{userId}_post_invoke_arn}",
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
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
              },
            },
          },
        },
      },
    });
  });

  it("should add request paramaters if a string is provided", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "post",
      summary: "Create user",
      requestInfo: {
        requestValidator: "strict",
        contentSchema: "MySchema",
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      servers: [],
      paths: {
        "users/{userId}": {
          post: {
            summary: "Create user",
            responses: {},
            "x-amazon-apigateway-integration": {
              httpMethod: "POST",
              payloadFormatVersion: "2.0",
              type: "aws_proxy",
              uri: "${users/{userId}_post_invoke_arn}",
            },
            "x-amazon-apigateway-request-validator": "strict",
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/MySchema",
                  },
                },
              },
            },
          },
        },
      },
      info: {
        title: "",
        version: "",
        description: "",
        contact: {
          name: "",
          email: "",
          url: "",
        },
      },
      components: {
        securitySchemes: {},
        schemas: {},
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
      security: [],
    });
  });

  it("Should add request parameters to a route if provided", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "get",
      summary: "Get user by ID",
      requestInfo: {
        requestParameters: [
          {
            name: "userId",
            type: "path",
            required: true,
            description: "The ID of the user",
            schema: z.uuid(),
          },
        ],
      },
    };

    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      servers: [],
      info: {
        title: "",
        version: "",
        description: "",
        contact: {
          name: "",
          email: "",
          url: "",
        },
      },
      paths: {
        "users/{userId}": {
          get: {
            summary: "Get user by ID",
            responses: {},
            "x-amazon-apigateway-integration": {
              httpMethod: "GET",
              payloadFormatVersion: "2.0",
              type: "aws_proxy",
              uri: "${users/{userId}_get_invoke_arn}",
            },
            parameters: [
              {
                name: "userId",
                in: "path",
                required: true,
                description: "The ID of the user",
                schema: {
                  type: "string",
                  format: "uuid",
                  pattern:
                    "^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$",
                },
              },
            ],
          },
        },
      },
      components: {
        securitySchemes: {},
        schemas: {},
      },
      security: [],
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
    });
  });

  it("should add route specific security", () => {
    spec.addRoute({
      routeName: "test",
      method: "get",
      summary: "test",
      routeSecurity: [{ OAuth2: ["read:write"] }],
      requestInfo: {},
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {
        test: {
          get: {
            summary: "test",
            responses: {},
            "x-amazon-apigateway-integration": {
              type: "aws_proxy",
              httpMethod: "GET",
              uri: "${test_get_invoke_arn}",
              payloadFormatVersion: "2.0",
            },
            security: [
              {
                OAuth2: ["read:write"],
              },
            ],
          },
        },
      },
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
      servers: [],
      components: {
        securitySchemes: {},
        schemas: {},
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
      security: [],
    });
  });
});
