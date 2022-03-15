import { CrudityOptions } from "./interfaces/CrudityOptions";
import { OpenApi3 } from "./interfaces/OpenApi3";

export class Swagger {
  constructor(private resourceName: string, private options: CrudityOptions) {}

  generate(): OpenApi3 {
    return {
      openapi: "3.0.0",
      info: {
        title: `Crudity ${this.resourceName}`,
        version: "1.0.0",
        description: `The RESTful API generated by Crudity for resource '${this.resourceName}'`,
      },
      paths: {},
    };
  }
}
