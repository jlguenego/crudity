import express, { Router } from "express";
import { Resource } from "./src/Resource";
import { CrudityOptions } from "./src/CrudityOptions";

export interface Idable {
  id?: string;
}

/**
 * Middleware that exposes a CRUD on a resource
 *
 * @export
 * @class Crudity
 * @template T
 */
export class Crudity<T extends Idable> {
  resource = new Resource<T>(this.options);
  router: Router;
  constructor(private options: CrudityOptions) {
    const app = express.Router();

    app.post("/", (req, res) => {
      if (req.body instanceof Array) {
        // bulk scenario
        const array: T[] = [];
        for (const item of req.body as T[]) {
          array.push(this.resource.add(item));
        }
        return res.status(201).json(array);
      }
      const t: T = req.body;
      const newT = this.resource.add(t);
      return res.status(201).json(newT);
    });

    app.get("/", (req, res) => {
      return res.json(this.resource.array$.value);
    });

    app.get("/:id", (req, res) => {
      const id = req.params.id;
      if (!this.resource.map[id]) {
        return res.status(404).end();
      }
      return res.json(this.resource.map[id]);
    });

    app.put("/:id", (req, res) => {
      const id = req.params.id;
      if (!this.resource.map[id]) {
        return res.status(404).end();
      }
      req.body.id = id;
      const t = this.resource.rewrite(req.body as T);
      return res.json(t);
    });

    app.patch("/:id", (req, res) => {
      const id = req.params.id;
      if (!this.resource.map[id]) {
        return res.status(404).end();
      }
      const t = this.resource.patch(id, req.body);
      return res.json(t);
    });

    app.delete("/", (req, res) => {
      if (!(req.body instanceof Array)) {
        this.resource.removeAll();
        return res.status(204).end();
      }
      const ids: string[] = req.body;
      this.resource.remove(ids);
      return res.status(204).end();
    });

    app.delete("/:id", (req, res) => {
      const id = req.params.id;
      this.resource.remove([id]);
      return res.status(204).end();
    });

    this.router = app;
  }
}
