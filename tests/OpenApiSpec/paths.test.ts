import { SecurityScheme } from "./../../src/types/AwsAuthorizerSheme";
import { z } from "zod";
import {
  OpenApiSpec,
  AddRouteParams,
  RequestValidationEnum,
  RequestParameterType,
} from "../../src/index";
import { info } from "node:console";

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
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({ users: { get: { summary: "Get all users", responses: {} } } });
  });

  it("should allow setting paths with a post request and get request", () => {
    const path1: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
    };
    const path2: AddRouteParams = {
      routeName: "users",
      method: "post",
      summary: "Create a post",
    };
    spec.addRoute(path1);
    spec.addRoute(path2);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      users: {
        get: { summary: "Get all users", responses: {} },
        post: { summary: "Create a post", responses: {} },
      },
    });
  });

  it("should allow setting paths with multiple routes", () => {
    const path1: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
    };
    const path2: AddRouteParams = {
      routeName: "products",
      method: "post",
      summary: "Create a product",
    };
    spec.addRoute(path1);
    spec.addRoute(path2);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      users: { get: { summary: "Get all users", responses: {} } },
      products: { post: { summary: "Create a product", responses: {} } },
    });
  });

  it("Throw error if method already exists for a route", () => {
    const path1: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users",
    };
    const path2: AddRouteParams = {
      routeName: "users",
      method: "get",
      summary: "Get all users again",
    };
    spec.addRoute(path1);
    expect(() => spec.addRoute(path2)).toThrow("Method get already exists for route users");
  });

  it("Should allow for path parameters", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "get",
      summary: "Get user by ID",
    };
    const path2: AddRouteParams = {
      routeName: "users/{userId}",
      method: "post",
      summary: "Create a user by ID",
    };
    const path3: AddRouteParams = {
      routeName: "users",
      method: "post",
      summary: "Get user by ID again",
    };

    spec.addRoute(path);
    spec.addRoute(path2);
    spec.addRoute(path3);

    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      "users/{userId}": {
        get: { summary: "Get user by ID", responses: {} },
        post: { summary: "Create a user by ID", responses: {} },
      },
      users: { post: { summary: "Get user by ID again", responses: {} } },
    });
  });

  it("Should add request validation to a route if provided", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "get",
      summary: "Get user by ID",
      requestValidator: RequestValidationEnum.STRICT,
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();
    expect(content.paths).toEqual({
      "users/{userId}": {
        get: {
          responses: {},
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
      requestValidator: RequestValidationEnum.STRICT,
      requestBodySchema: myZodObj,
    };
    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content.paths).toEqual({
      "users/{userId}": {
        post: {
          summary: "Create user",
          "x-amazon-apigateway-request-validator": "strict",
          responses: {},
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

  it("Should add request parameters to a route if provided", () => {
    const path: AddRouteParams = {
      routeName: "users/{userId}",
      method: "get",
      summary: "Get user by ID",
      requestParameters: [
        {
          name: "userId",
          type: RequestParameterType.PATH,
          required: true,
          description: "The ID of the user",
          schema: z.uuid(),
        },
      ],
    };

    spec.addRoute(path);
    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      info: "basic info",
      paths: {
        "users/{userId}": {
          get: {
            summary: "Get user by ID",
            responses: {},
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
});
