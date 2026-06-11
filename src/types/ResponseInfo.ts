import { AdditionalResponses } from "./AdditionalResponses";
import { HttpStatusCodes } from "./HttpStatusCodes";
import { RequestInfo } from "./RequestInfo";

export type ResponseInfo = {
  happyPathStatusCode: 200 | 201;
  description: string;
  additionalResponses?: AdditionalResponses[];
  /** @deprecated Use additionalResponses instead */
  additionalStatusCodes?: HttpStatusCodes[];
} & Required<Omit<RequestInfo, "requestValidator" | "requestParameters">>;
