import { RequestInfo } from "./RequestInfo";

export type ResponseInfo = {
    happyPathStatusCode: 200 | 201;
    description: string;
} & Required<Omit<RequestInfo, "requestValidator" | "requestParameters">>