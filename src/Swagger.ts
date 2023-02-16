import { CrudityOptions } from "./interfaces/CrudityOptions";
import { ContactObject, OpenApi3 } from "./interfaces/OpenApi3";
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
  private singularResourceName: string;
  constructor(
    private req: Request,
    private resourceName: string,
    private options: CrudityOptions
  ) {
    this.singularResourceName = getSingular(this.resourceName, this.options);
  }

  generate(): OpenApi3 {
    return {
      openapi: "3.0.3",
      info: {
        title: `Crudity ${this.resourceName}`,
        version: process.env.npm_package_version as string,
        description: `The RESTful API generated by Crudity for resource '${this.resourceName}'`,
        contact: process.env.npm_package_author as ContactObject,
      },
      servers: [
        {
          url: getEndPoint(this.req),
        },
      ],
      paths: {
        "/": {
          parameters: [
            {
              name: "hateoas",
              in: "query",
              schema: {
                type: "string",
                enum: ["none", "header", "body"],
              },
            },
          ],
          summary: `CRUD on ${this.resourceName}`,
          description: `Create Retrieve Update Delete some or all ${this.resourceName}.`,
          get: {
            tags: [this.resourceName],
            description: `Return a list of ${this.resourceName}.`,
            externalDocs,
            operationId: `RetrieveAll${pascalize(this.resourceName)}`,
            parameters: [
              {
                name: "pageSize",
                description:
                  "Number of items per page. " +
                  "0 means no pagination (dangerous if billion of records.).",
                in: "query",
                schema: {
                  type: "integer",
                  default: 20,
                },
              },
              {
                name: "page",
                description: "Page index starting at 1.",
                in: "query",
                schema: {
                  type: "integer",
                  default: 1,
                },
              },
              {
                name: "orderBy",
                description:
                  "Order by a given fields. " +
                  "Prefix + or - for ascendant or descendant order. " +
                  "Separate field with comma.",
                in: "query",
                schema: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
              {
                name: "filter",
                description: "Filter by fields.",
                in: "query",
                style: "deepObject",
                schema: {
                  type: "object",
                },
              },
              {
                name: "select",
                description: "Return only the listed fields.",
                in: "query",
                schema: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                },
              },
            ],
            responses: {
              "200": {
                description: "successful operation",
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        {
                          $ref: `#/components/schemas/${pascalize(
                            this.singularResourceName
                          )}Array`,
                        },
                        {
                          type: "object",
                          properties: {
                            links: {
                              type: "array",
                            },
                            result: {
                              $ref: `#/components/schemas/${pascalize(
                                this.singularResourceName
                              )}Array`,
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: [this.resourceName],
            description: `Create a new ${this.singularResourceName}`,
            externalDocs,
            operationId: `Create${pascalize(this.singularResourceName)}`,
            requestBody: {
              description: `A JSON object reflecting the new ${this.singularResourceName} to be added or a bulk ${this.singularResourceName} list.`,
              required: true,
              content: {
                "application/json": {
                  schema: {
                    oneOf: [
                      {
                        $ref: `#/components/schemas/New${pascalize(
                          this.singularResourceName
                        )}`,
                      },
                      {
                        type: "array",
                        items: {
                          $ref: `#/components/schemas/New${pascalize(
                            this.singularResourceName
                          )}`,
                        },
                      },
                    ],
                  },
                },
              },
            },
            responses: {
              "201": {
                description: `${this.singularResourceName} added with success.`,
                content: {
                  "application/json": {
                    schema: {
                      oneOf: [
                        {
                          $ref: `#/components/schemas/${pascalize(
                            this.singularResourceName
                          )}`,
                        },
                        {
                          type: "array",
                          items: {
                            $ref: `#/components/schemas/${pascalize(
                              this.singularResourceName
                            )}`,
                          },
                        },
                      ],
                    },
                  },
                },
              },
              "400": {
                description: `Bad request. Probably the request body is not correct.`,
              },
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
          ["New" + pascalize(this.singularResourceName)]: {
            type: "object",
            additionalProperties: {},
          },
          [pascalize(this.singularResourceName)]: {
            type: "object",
            properties: {
              id: {
                type: "string",
              },
            },
            required: ["id"],
            additionalProperties: {},
          },
          [pascalize(this.singularResourceName) + "Array"]: {
            type: "array",
            items: {
              $ref: `#/components/schemas/${pascalize(
                this.singularResourceName
              )}`,
            },
          },
        },
      },
    };
  }
}
