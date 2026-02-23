import { HttpMethod } from "./HttpMethod";

export type PathItem = {
    [key in HttpMethod]?: {
        summary: string;
    };
};