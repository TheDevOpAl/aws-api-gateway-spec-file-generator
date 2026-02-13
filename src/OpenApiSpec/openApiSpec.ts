import { writeFileSync } from "fs";

export class OpenApiSpec {
    private openApi: string = "3.0.1";

    private paths: any = {};
    private components: any = {};
    private securitySchemes: any = {};
    private writeToYamlFile: boolean = false;
    private fileName: string = "openapi-spec";
    private pathToFiles: string = "./";
    public getOpenApiSpecContent(): any {
        return {
            openapi: this.openApi,
            paths: this.paths,
            components: this.components,
            securitySchemes: this.securitySchemes
        }
    }

    constructor() {}

    setOpenApiVersion(version: string): void {
        this.openApi = version;
    }

    setFileName(fileName: string): void {
        this.fileName = fileName;
    }

    setPathToFiles(pathToFiles: string): void {
        this.pathToFiles = pathToFiles;
    }

    writeOpenApiSpec(): void {
        const specFileContent = this.getOpenApiSpecContent();

        writeFileSync(`${this.pathToFiles}${this.fileName}.${this.writeToYamlFile ? "yaml" : "json"}`, JSON.stringify(specFileContent, null, 2));
    }
}