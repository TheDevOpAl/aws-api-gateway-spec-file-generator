# aws-api-gateway-spec-file-generator

This package allows you to generate an Open Api specifications file based on zod/JSONSchema types.

How to install

```bash
npm i api-spec-generator zod
```

Zod is optional if you don't want to use it. I highly recommend using it, however, because it builds out JSON Schemas a lot easier than writing them by hand.

If you have feature requests for bug reports, please fill out an issue here: https://github.com/TheDevOpAl/aws-api-gateway-spec-file-generator/issues

This is an example of what you can do with this package. When I have time to write a proper readme, I will. For now, this will need to do.

### NOTE: The commented out sections are optional. Also, wherever you see schema being used, you can pass in a Zod Schema, JSON Schema, or a ref string for the name of the object that will be placed in #/components/schemas

```typescript
import { OpenApiSpec } from "api-spec-generator";
import { writeFileSync } from "node:fs";
import { z } from "zod";

const spec = new OpenApiSpec();

spec.setInfoBlock({
  title: "This is my title",
  description: "this is my description",
  version: "This can be anything, but open api readers might be upset",
  contactEmail: "fake-email@gmail.com",
  contactName: "This can be a team name",
  contactUrl: "https://www.what-am-i-doing.com/help-me-please",
});

spec.setGlobalRequestValidator("strict");

spec.setGlobalSecurity([
  {
    MyAuthorizer: [],
  },
]);

spec.addRoute({
  routeName: "/users/{userId}",
  method: "post",
  summary: "Create a new user",
  // routeSecurity: [
  //   {
  //     Oauth2: ["read:write"]
  //   }
  // ],
  requestInfo: {
    // contentType: "application/json",
    // requestValidator: "request-parameter-only",
    contentSchema: "JSONSchema",
    requestParameters: [
      {
        name: "userId",
        type: "path",
        description: "The ID of the user",
        schema: "UserId", // zodSchema | JSONSchema | string
      },
    ],
  },
  responseInfo: {
    happyPathStatusCode: 200, // 200 | 201
    description: "hello",
    contentSchema: z.object({ username: z.string() }),
    contentType: "application/json",
    additionalStatusCodes: [204, 400, 401, 403, 404, 418], // note this can be any status code you want
  },
});

spec.addSecuritySchemeAuthorizer({
  securityName: "MyAuthorizer",
  authorizerType: "token",
  // authorizerResultsCacheTtlInSeconds: 300
  // authorizerUri: "invoke arn goes here if needed"
});

spec.addSchema("UserId", z.uuid());

spec.addSchema("JSONSchema", {
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
});

spec.setServers([
  {
    url: "https://www.what-am-i-doing.com/help-me-please",
    description: "This is a description to give an understanding of what you do with this, I guess",
  },
]);

const content = spec.getOpenApiSpecContent();

writeFileSync("openapi-spec.json", JSON.stringify(content, null, 2));
```
