import { z } from "zod";
import { AddRouteParams, OpenApiSpec } from "../../src/index";

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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      users: {
        get: {
          summary: "Get all users",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    const path2: AddRouteParams = {
      routeName: "users",
      method: "post",
      summary: "Create a post",
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    spec.addRoute(path1);
    spec.addRoute(path2);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      users: {
        get: {
          summary: "Get all users",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
        post: {
          summary: "Create a post",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_post_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    const path2: AddRouteParams = {
      routeName: "products",
      method: "post",
      summary: "Create a product",
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    spec.addRoute(path1);
    spec.addRoute(path2);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      users: {
        get: {
          summary: "Get all users",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
      },
      products: {
        post: {
          summary: "Create a product",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${products_post_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    const path2: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users again",
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    const path2: AddRouteParams = {
      routeName: "users/{userId}",
      method: "post",
      summary: "Create a user by ID",
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    const path3: AddRouteParams = {
      routeName: "users",
      method: "post",
      summary: "Create a new User",
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };

    spec.addRoute(path);
    spec.addRoute(path2);
    spec.addRoute(path3);

    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      "users/{userId}": {
        get: {
          summary: "Get user by ID",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_userId_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
        post: {
          summary: "Create a user by ID",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_userId_post_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
      },
      users: {
        post: {
          summary: "Create a new User",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_post_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      "users/{userId}": {
        get: {
          summary: "Get user by ID",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-request-validator": "strict",
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_userId_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      "users/{userId}": {
        post: {
          summary: "Create user",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-request-validator": "strict",
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
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_userId_post_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
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
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      "users/{userId}": {
        post: {
          summary: "Create user",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
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
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_userId_post_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
      },
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
            description: "The ID of the user",
            schema: z.uuid(),
          },
        ],
      },
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    };

    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      "users/{userId}": {
        get: {
          summary: "Get user by ID",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
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
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${users_userId_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
      },
    });
  });

  it("should add route specific security", () => {
    spec.addRoute({
      routeName: "test",
      method: "get",
      summary: "test",
      routeSecurity: [{ OAuth2: ["read:write"] }],
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: z.object({ username: z.string() }),
        contentType: "application/json",
        additionalStatusCodes: [],
      },
    });

    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      test: {
        get: {
          summary: "test",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${test_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
          security: [
            {
              OAuth2: ["read:write"],
            },
          ],
        },
      },
    });
  });

  it("should add two addition status codes", () => {
    spec.addRoute({
      routeName: "test",
      method: "get",
      summary: "test",
      routeSecurity: [],
      requestInfo: {},
      responseInfo: {
        happyPathStatusCode: 200,
        description: "hello",
        contentSchema: {
          type: "object",
          properties: {
            username: {
              type: "string",
            },
          },
          required: ["username"],
          additionalProperties: false,
        },
        contentType: "application/json",
        additionalStatusCodes: [401, 403],
      },
    });

    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      test: {
        get: {
          summary: "test",
          responses: {
            "200": {
              description: "hello",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      username: {
                        type: "string",
                      },
                    },
                    required: ["username"],
                    additionalProperties: false,
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
            },
            "403": {
              description: "Forbidden",
            },
          },
          "x-amazon-apigateway-integration": {
            type: "aws_proxy",
            httpMethod: "POST",
            uri: "${test_get_lambda_invoke_arn}",
            payloadFormatVersion: "2.0",
          },
        },
      },
    });
  });
});
