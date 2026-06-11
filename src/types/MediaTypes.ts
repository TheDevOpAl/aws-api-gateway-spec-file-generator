export const MediaTypes = {
  JSON: "application/json",
  PROBLEM_JSON: "application/problem+json",
  XML: "application/xml",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  MULTIPART_FORM_DATA: "multipart/form-data",
  TEXT_PLAIN: "text/plain",
  OCTET_STREAM: "application/octet-stream",
} as const;

export type MediaType = (typeof MediaTypes)[keyof typeof MediaTypes] | string;
