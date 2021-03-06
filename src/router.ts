import express from "express";

import { Idable, CrudityOptions, CrudityQueryString } from "./interface";
import { JsonResource } from "./json/JsonResource";
import { Validator } from "./Validator";
import { checkQueryString } from "./querystring";

export function crudity<T extends Idable>(
  opts?: Partial<CrudityOptions<T>>
): express.Router {
  const options: CrudityOptions<T> = {
    resource: new JsonResource<T>(),
    pageSize: 20,
    validator: new Validator<T>(),
    ...opts,
  };
  const resource = options.resource;
  const validator = options.validator;
  const app = express.Router();

  app.use(express.json());

  app.post("/", validator.post.bind(validator), (req, res) => {
    if (req.body instanceof Array) {
      // bulk scenario
      const array: T[] = [];
      for (const item of req.body as T[]) {
        array.push(resource.add(item));
      }
      return res.status(201).json(array);
    }
    const t: T = req.body;
    const newT = resource.add(t);
    return res.status(201).json(newT);
  });

  app.get("/", (req, res) => {
    try {
      checkQueryString(req.query);
    } catch (e) {
      return res.status(400).end("queryString not well formatted: " + e);
    }
    // transform as a class the req.query and check its validity.
    const query = req.query as CrudityQueryString;
    const array = resource.get(query, options.pageSize);
    return res.json(array);
  });

  app.get("/:id", (req, res) => {
    const id = req.params.id;
    const t = resource.getOne(id);
    if (!t) {
      return res.status(404).end();
    }
    return res.json(t);
  });

  app.put("/:id", (req, res) => {
    const id = req.params.id;
    const t = resource.getOne(id);
    if (!t) {
      return res.status(404).end();
    }
    req.body.id = id;
    const newT = resource.rewrite(req.body as T);
    return res.json(newT);
  });

  app.patch("/:id", (req, res) => {
    const id = req.params.id;
    const t = resource.getOne(id);
    if (!t) {
      return res.status(404).end();
    }
    const newT = resource.patch(id, req.body);
    return res.json(newT);
  });

  app.delete("/", (req, res) => {
    if (!(req.body instanceof Array)) {
      resource.removeAll();
      return res.status(204).end();
    }
    const ids: string[] = req.body;
    resource.remove(ids);
    return res.status(204).end();
  });

  app.delete("/:id", (req, res) => {
    const id = req.params.id;
    resource.remove([id]);
    return res.status(204).end();
  });

  return app;
}
