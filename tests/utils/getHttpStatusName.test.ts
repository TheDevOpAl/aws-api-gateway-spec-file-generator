import { getHttpStatusCodeName } from "../../src/utils/getHttpStatusCodeName";
describe("getHttpStatusCodeName", () => {
  it("should return the correct status name for known status codes", () => {
    expect(getHttpStatusCodeName(200)).toBe("OK");
    expect(getHttpStatusCodeName(404)).toBe("Not Found");
    expect(getHttpStatusCodeName(418)).toBe("I'm a teapot");
    expect(getHttpStatusCodeName(500)).toBe("Internal Server Error");
    expect(getHttpStatusCodeName("default")).toBe("Unexpected Error");
  });
  it("should throw an error for unknown status codes", () => {
    expect(() => getHttpStatusCodeName(999 as any)).toThrow("Unknown HTTP status code: 999");
  });
});
