export type AuthorizerType = "token" | "request";

export type AwsAuthorizerScheme = {
  securityName: string;
  authorizerType: AuthorizerType;
  authorizerUri?: string;
  authorizerResultTtlInSeconds?: number;
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
    authorizerResultTtlInSeconds: number;
  };
};
