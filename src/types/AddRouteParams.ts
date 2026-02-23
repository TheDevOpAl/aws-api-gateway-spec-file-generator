import { HttpMethod } from "./HttpMethod";

export type AddRouteParams = {
    routeName: string;
    method: HttpMethod;
    summary: string;
};