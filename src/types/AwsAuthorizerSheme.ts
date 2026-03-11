export type AuthorizerType = "token" | "request";

export type AwsAuthorizerScheme = {
  securityName: string;
  authorizerType: AuthorizerType;
  authorizerUri?: string;
  authorizerResultsCacheTtlInSeconds?: number;
};

export type SecurityScheme = {
  [key: string]: Authorizer;
};

export type Authorizer = {
  type: string;
  name: string;
  in: string;
  "x-amazon-apigateway-authtype": string;
  "x-amazon-apigateway-authorizer": {
    type: AuthorizerType;
    authorizerUri: string;
    identitySource?: string;
    "x-amazon-apigateway-results-cache-ttl-in-seconds": number;
  };
};
