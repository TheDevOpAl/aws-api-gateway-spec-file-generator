import { OpenApiSpec } from "../../src";
import { Tag } from "../../src/types/Tag";

describe("Tags", () => {
  it("Should add tags to the open api spec", () => {
    const spec = new OpenApiSpec();
    const tags: Tag[] = [
      {
        name: "test tag",
        description: "test description",
      },
    ];

    spec.setTags(tags);

    const content = spec.getOpenApiSpecContent();

    expect(content.tags).toEqual(tags);
  });
});
