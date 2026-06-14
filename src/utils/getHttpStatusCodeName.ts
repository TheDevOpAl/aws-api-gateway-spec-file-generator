import { HTTP_STATUS_REASONS, HttpStatusCodes } from "../types/HttpStatusCodes";

export const getHttpStatusCodeName = (
  statusCode: HttpStatusCodes,
): (typeof HTTP_STATUS_REASONS)[keyof typeof HTTP_STATUS_REASONS] => {
  if (!HTTP_STATUS_REASONS[statusCode]) {
    throw new Error(`Unknown HTTP status code: ${statusCode}`);
  }

  return HTTP_STATUS_REASONS[statusCode];
};
