import { HttpMethod } from "./HttpMethod";
import { Security } from "./Security";
import { RequestInfo } from "./RequestInfo";
import { ResponseInfo } from "./ResponseInfo";

export type AddRouteParams = {
  routeName: string;
  method: HttpMethod;
  summary: string;
  requestInfo: RequestInfo;
  responseInfo: ResponseInfo;
  routeSecurity?: Security[];
};
