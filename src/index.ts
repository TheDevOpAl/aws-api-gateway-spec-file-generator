import { OpenApiSpec } from './OpenApiSpec/openApiSpec.ts';
const OpenApiSpecInstance = new OpenApiSpec();

OpenApiSpecInstance.setOpenApiVersion("3.0.1");

const specFileContent = OpenApiSpecInstance.getOpenApiSpecContent();
console.log(specFileContent);

// OpenApiSpecInstance.writeOpenApiSpec();