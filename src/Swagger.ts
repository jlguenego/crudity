import { CrudityOptions } from "./interfaces/CrudityOptions";
import { OpenApi3 } from "./interfaces/OpenApi3";
import npmPackage from "../package.json";
import { Request } from "express";
import { pascalize } from "./misc/utils";

function getEndPoint(req: Request) {
  return req.protocol + "://" + req.get("host") + req.baseUrl;
}

function getSingular(resourceName: string, options: CrudityOptions) {
  if (options.singularResourceName) {
    return options.singularResourceName;
  }
  return resourceName.replace(/s$/, "");
}

const externalDocs = {
  url: "https://github.com/jlguenego/crudity",
};

export class Swagger {
  private singularResourceName = getSingular(this.resourceName, this.options);
  constructor(
    private req: Request,
    private resourceName: string,
    private options: CrudityOptions
  ) {}

  generate(): OpenApi3 {
    return {
      openapi: "3.0.3",
      info: {
        title: `Crudity ${this.resourceName}`,
        version: npmPackage.version,
        description: `The RESTful API generated by Crudity for resource '${this.resourceName}'`,
        contact: npmPackage.author,
      },
      servers: [
        {
          url: getEndPoint(this.req),
        },
      ],
      paths: {
        "/": {
          summary: `CRUD on ${this.resourceName}`,
          description: `Create Retrieve Update Delete some or all ${this.resourceName}.`,
          get: {
            tags: [this.resourceName],
            description: `Return a list of ${this.resourceName}.`,
            externalDocs,
            operationId: `RetrieveAll${pascalize(this.resourceName)}`,
            responses: {
              default: { description: "truc bidule" },
            },
          },
          post: {
            tags: [this.resourceName],
            description: `Create a new ${this.singularResourceName}`,
            externalDocs,
            operationId: `Create${pascalize(this.singularResourceName)}`,
            requestBody: {
              description: `A JSON object reflecting the ${this.singularResourceName}`,
              required: true,
              content: {
                "application/json": {
                  schema: {
                    $ref: `#/components/schemas/${pascalize(
                      this.singularResourceName
                    )}`,
                  },
                },
              },
            },
            responses: {
              default: { description: "truc bidule" },
            },
          },
          delete: {
            tags: [this.resourceName],
            description: `Delete some ${this.resourceName}`,
            externalDocs,
            operationId: `Delete${pascalize(this.resourceName)}`,
            responses: {
              default: { description: "truc bidule" },
            },
          },
        },
        "/{id}": {
          description: `CRUD on a specific ${this.singularResourceName}.`,
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: `Unique id of the ${this.singularResourceName}.`,
              schema: {
                type: "integer",
              },
            },
          ],
          get: {
            tags: [this.resourceName],
            description: `Get a ${this.singularResourceName} given its id.`,
            externalDocs,
            operationId: `RetrieveOne${pascalize(this.singularResourceName)}`,
            responses: {
              default: { description: "truc bidule" },
            },
          },
          put: {
            tags: [this.resourceName],
            description: `Replace an existing ${this.singularResourceName}`,
            externalDocs,
            operationId: `ReplaceOne${pascalize(this.singularResourceName)}`,
            responses: {
              default: { description: "truc bidule" },
            },
          },
          patch: {
            tags: [this.resourceName],
            description: `Patch an existing ${this.singularResourceName}`,
            externalDocs,
            operationId: `PatchOne${pascalize(this.singularResourceName)}`,
            responses: {
              default: { description: "truc bidule" },
            },
          },
          delete: {
            tags: [this.resourceName],
            description: `Delete a ${this.singularResourceName}`,
            externalDocs,
            operationId: `DeleteOne${pascalize(this.singularResourceName)}`,
            responses: {
              default: { description: "truc bidule" },
            },
          },
        },
      },
      components: {
        schemas: {
          [pascalize(this.singularResourceName)]: {},
        },
      },
    };
  }
}
