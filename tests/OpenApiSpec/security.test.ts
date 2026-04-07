import { OpenApiSpec } from "../../src";

describe("OpenApiSpec security", () => {
  let spec: OpenApiSpec;

  beforeEach(() => {
    spec = new OpenApiSpec();
  });

  it("should initialize with empty security schemes and security", () => {
    const content = spec.getOpenApiSpecContent();
    expect(content.components.securitySchemes).toEqual({});
    expect(content.security).toEqual([]);
  });

  it("should allow adding a security scheme and update security", () => {
    spec.addSecuritySchemeAuthorizer({
      securityName: "MyAuthorizer",
      authorizerType: "request",
      authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:my-authorizer",
      authorizerResultTtlInSeconds: 300,
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
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
      components: {
        schemas: {},
        securitySchemes: {
          MyAuthorizer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "custom",
            "x-amazon-apigateway-authorizer": {
              type: "request",
              authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:my-authorizer",
              authorizerResultTtlInSeconds: 300,
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
      security: [],
    });
  });

  it("should test token authorizer type", () => {
    spec.addSecuritySchemeAuthorizer({
      securityName: "TokenAuthorizer",
      authorizerType: "token",
      authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:token-authorizer",
      authorizerResultTtlInSeconds: 600,
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
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
      components: {
        schemas: {},
        securitySchemes: {
          TokenAuthorizer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "custom",
            "x-amazon-apigateway-authorizer": {
              type: "token",
              authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:token-authorizer",
              authorizerResultTtlInSeconds: 600,
              identitySource: "method.request.header.Authorization",
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
      security: [],
    });
  });

  it("should template the authorizerUri if not provided AND test no seconds passed into ttl", () => {
    spec.addSecuritySchemeAuthorizer({
      securityName: "DefaultUriAuthorizer",
      authorizerType: "request",
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
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
      components: {
        schemas: {},
        securitySchemes: {
          DefaultUriAuthorizer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "custom",
            "x-amazon-apigateway-authorizer": {
              type: "request",
              authorizerUri: "${DefaultUriAuthorizer_lambda_invoke_arn}",
              authorizerResultTtlInSeconds: 0,
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
      security: [],
    });
  });

  it("should add global security", () => {
    spec.addSecuritySchemeAuthorizer({
      securityName: "OAuth2",
      authorizerType: "token",
    });

    spec.setGlobalSecurity([
      {
        OAuth2: [],
      },
    ]);

    const content = spec.getOpenApiSpecContent();

    expect(content.security).toEqual([
      {
        OAuth2: [],
      },
    ]);
  });
});
