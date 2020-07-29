import express from "express";
import { Resource } from "./src/Resource";
import { CrudityOptions } from "./src/CrudityOpions";

const app = express.Router();

/**
 * crudity middleware
 *
 * @export
 * @param {*} options
 */
export default function crudity<T extends { id?: string }>(
  options: CrudityOptions
) {
  const resource = new Resource<T>(options);

  app.get("/", (req, res) => {
    return res.json(resource.array$.value);
  });

  app.post("/", (req, res) => {
    const t: T = req.body;
    const newT = resource.add(t);
    return res.status(201).json(newT);
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
