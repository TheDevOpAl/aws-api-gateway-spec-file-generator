import { OpenApiSpec } from "../../src";
import { AuthorizerTypeEnum } from "../../src/types/AwsAuthorizerSheme";

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
      authorizerType: AuthorizerTypeEnum.REQUEST,
      authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:my-authorizer",
      authorizerResultsCacheTtlInSeconds: 300,
    });

    const content = spec.getOpenApiSpecContent();

    console.log(JSON.stringify(content, null, 2));
    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
      components: {
        securitySchemes: {
          MyAuthorizer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "custom",
            "x-amazon-apigateway-authorizer": {
              type: "request",
              authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:my-authorizer",
              "x-amazon-apigateway-results-cache-ttl-in-seconds": 300,
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
      security: [
        {
          MyAuthorizer: [],
        },
      ],
    });
  });

  it("should test token authorizer type", () => {
    spec.addSecuritySchemeAuthorizer({
      securityName: "TokenAuthorizer",
      authorizerType: AuthorizerTypeEnum.TOKEN,
      authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:token-authorizer",
      authorizerResultsCacheTtlInSeconds: 600,
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
      components: {
        securitySchemes: {
          TokenAuthorizer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "custom",
            "x-amazon-apigateway-authorizer": {
              type: "token",
              authorizerUri: "arn:aws:lambda:us-east-1:123456789012:function:token-authorizer",
              "x-amazon-apigateway-results-cache-ttl-in-seconds": 600,
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
      security: [
        {
          TokenAuthorizer: [],
        },
      ],
    });
  });

  it("should template the authorizerUri if not provided AND test no seconds passed into ttl", () => {
    spec.addSecuritySchemeAuthorizer({
      securityName: "DefaultUriAuthorizer",
      authorizerType: AuthorizerTypeEnum.REQUEST,
    });

    const content = spec.getOpenApiSpecContent();

    expect(content).toEqual({
      openapi: "3.0.1",
      paths: {},
      components: {
        securitySchemes: {
          DefaultUriAuthorizer: {
            type: "apiKey",
            name: "Authorization",
            in: "header",
            "x-amazon-apigateway-authtype": "custom",
            "x-amazon-apigateway-authorizer": {
              type: "request",
              authorizerUri: "${authorizer_lambda_arn}",
              "x-amazon-apigateway-results-cache-ttl-in-seconds": 0,
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
      security: [
        {
          DefaultUriAuthorizer: [],
        },
      ],
    });
  });
});
