import { z } from "zod";
import { OpenApiSpec, AddRouteParams, RequestValidationEnum } from "../../src/index";

describe("OpenApiSpec paths", () => {
    let spec: OpenApiSpec;

    beforeEach(()=> {
        spec = new OpenApiSpec();
    })

    it("should initialize with empty paths", () => {
        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({});
    });

    it("should allow setting paths with a get request", () => {
        const path: AddRouteParams = { routeName: "users", method: "get", summary: "Get all users" };
        spec.addRoute(path);
        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({ users: { get: { summary: "Get all users" } } });
    });

    it("should allow setting paths with a post request and get request", () => {
        const path1: AddRouteParams = { routeName: "users", method: "get", summary: "Get all users" };
        const path2: AddRouteParams = { routeName: "users", method: "post", summary: "Create a post" };
        spec.addRoute(path1);
        spec.addRoute(path2);
        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({ users: { get: { summary: "Get all users" }, post: { summary: "Create a post" } } });
    });

    it("should allow setting paths with multiple routes", () => {
        const path1: AddRouteParams = { routeName: "users", method: "get", summary: "Get all users" };
        const path2: AddRouteParams = { routeName: "products", method: "post", summary: "Create a product" };
        spec.addRoute(path1);
        spec.addRoute(path2);
        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({ users: { get: { summary: "Get all users" } }, products: { post: { summary: "Create a product" } } });
    });

    it("Throw error if method already exists for a route", () => {
        const path1: AddRouteParams = { routeName: "users", method: "get", summary: "Get all users" };
        const path2: AddRouteParams = { routeName: "users", method: "get", summary: "Get all users again" };
        spec.addRoute(path1);
        expect(() => spec.addRoute(path2)).toThrow("Method get already exists for route users");
    })

    it("Should allow for path parameters", () => {
        const path: AddRouteParams = { routeName: "users/{userId}", method: "get", summary: "Get user by ID" };
        const path2: AddRouteParams = { routeName: "users/{userId}", method: "post", summary: "Create a user by ID" };
        const path3: AddRouteParams = { routeName: "users", method: "post", summary: "Get user by ID again" };

        spec.addRoute(path);
        spec.addRoute(path2);
        spec.addRoute(path3);

        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({ "users/{userId}": { get: { summary: "Get user by ID" }, post: { summary: "Create a user by ID" } }, users: { post: { summary: "Get user by ID again" } } });
    })

    it("Should add request validation to a route if provided", () => {
        const path: AddRouteParams = { routeName: "users/{userId}", method: "get", summary: "Get user by ID", requestValidator: RequestValidationEnum.STRICT };
        spec.addRoute(path);
        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({ "users/{userId}": { get: { summary: "Get user by ID", "x-amazon-apigateway-request-validator": "strict" } } });
    })

    it("Should add a requestBody to a route if provided", () => {
        const myZodObj = z.object({my: 'test', num: 1});
        const path: AddRouteParams = { routeName: "users/{userId}", method: "get", summary: "Get user by ID", requestValidator: RequestValidationEnum.STRICT, requestBodySchema: myZodObj};
        spec.addRoute(path);
        const content = spec.getOpenApiSpecContent();
        expect(content.paths).toEqual({ "users/{userId}": { get: { summary: "Get user by ID", "x-amazon-apigateway-request-validator": "strict" } } });
    })
});