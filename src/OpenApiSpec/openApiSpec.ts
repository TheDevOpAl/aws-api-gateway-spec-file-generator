import { AddRouteParams } from "../types/AddRouteParams";
import { PathItem } from "../types/PathItem";

export class OpenApiSpec {
    private openApi: string = "3.0.1";
    private paths: Record<string, PathItem> = {};
    private components: any = {};
    private securitySchemes: any = {};

    public getOpenApiSpecContent() {
        return {
            openapi: this.openApi,
            paths: this.paths,
            components: this.components,
            securitySchemes: this.securitySchemes
        }
    }

    setOpenApiVersion(version: string): void {
        this.openApi = version;
    }

    addRoute({routeName, method, summary}: AddRouteParams): void {

        if (this.paths[routeName]?.[method]) {
            throw new Error(`Method ${method} already exists for route ${routeName}`);
        }

        this.paths[routeName] = {
            ...this.paths[routeName],
            [method]: {
                summary
            }
        };
    }
}