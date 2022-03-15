import { CrudityOptions } from "./interfaces/CrudityOptions";
import { OpenApi3 } from "./interfaces/OpenApi3";
import npmPackage from "../package.json";
import { Request } from "express";

function getEndPoint(req: Request) {
  return req.protocol + "://" + req.get("host") + req.baseUrl;
}

export class Swagger {
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
        "/": {},
      },
    };
  }
}
