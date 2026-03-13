import { HttpMethod } from "./HttpMethod";
import { Security } from "./Security";
import { RequestInfo } from "./RequestInfo";

export type AddRouteParams = {
  routeName: string;
  method: HttpMethod;
  summary: string;
  requestInfo: RequestInfo;
  responses?: {};
  routeSecurity?: Security[];
};
