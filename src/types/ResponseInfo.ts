import { HttpStatusCodes } from "./HttpStatusCodes";
import { RequestInfo } from "./RequestInfo";

export type ResponseInfo = {
  happyPathStatusCode: 200 | 201;
  description: string;
  additionalStatusCodes: HttpStatusCodes[];
} & Required<Omit<RequestInfo, "requestValidator" | "requestParameters">>;
