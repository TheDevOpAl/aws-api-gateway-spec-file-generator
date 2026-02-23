import { OpenApiSpec } from "./OpenApiSpec/openApiSpec";

const spec = new OpenApiSpec();
spec.setOpenApiVersion("3.0.0");
spec.addRoute({ routeName: "users", method: "get", summary: "Get all users" });
spec.addRoute({ routeName: "users", method: "post", summary: "Create a user" });
spec.addRoute({ routeName: "products", method: "get", summary: "Get all products" });
spec.addRoute({ routeName: "products/{productId}", method: "post", summary: "Create a product" });
spec.addRoute({ routeName: "products/{productId}", method: "get", summary: "Get a product by ID" });

console.log(JSON.stringify(spec.getOpenApiSpecContent(), null, 2));