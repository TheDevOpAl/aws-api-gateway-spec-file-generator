export enum AuthorizerTypeEnum {
  TOKEN = "token",
  REQUEST = "request",
}

export type AwsAuthorizerScheme = {
  securityName: string;
  authorizerType: AuthorizerTypeEnum;
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
    type: AuthorizerTypeEnum;
    authorizerUri: string;
    identitySource?: string;
    "x-amazon-apigateway-results-cache-ttl-in-seconds": number;
  };
};
