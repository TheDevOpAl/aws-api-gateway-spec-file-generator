"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApiSpec = void 0;
var fs_1 = require("fs");
var OpenApiSpec = /** @class */ (function () {
    function OpenApiSpec() {
        this.openApi = "3.0.1";
        this.paths = {};
        this.components = {};
        this.securitySchemes = {};
        this.writeToYamlFile = false;
        this.fileName = "openapi-spec";
        this.pathToFiles = "./";
    }
    OpenApiSpec.prototype.getOpenApiSpecContent = function () {
        return {
            openapi: this.openApi,
            paths: this.paths,
            components: this.components,
            securitySchemes: this.securitySchemes
        };
    };
    OpenApiSpec.prototype.setOpenApiVersion = function (version) {
        this.openApi = version;
    };
    OpenApiSpec.prototype.setFileName = function (fileName) {
        this.fileName = fileName;
    };
    OpenApiSpec.prototype.setPathToFiles = function (pathToFiles) {
        this.pathToFiles = pathToFiles;
    };
    OpenApiSpec.prototype.writeOpenApiSpec = function () {
        var specFileContent = this.getOpenApiSpecContent();
        (0, fs_1.writeFileSync)("".concat(this.pathToFiles).concat(this.fileName, ".").concat(this.writeToYamlFile ? "yaml" : "json"), JSON.stringify(specFileContent, null, 2));
    };
    return OpenApiSpec;
}());
exports.OpenApiSpec = OpenApiSpec;
