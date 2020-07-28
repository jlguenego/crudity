import express from "express";
import { BehaviorSubject } from "rxjs";
import { Resource } from "./resource";

interface CrudityOptions {
  filename: string;
}

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
  const resource = new Resource<T>();
  app.get("/", (req, res) => {
    return res.json(resource.array);
  });
  app.post("/", (req, res) => {
    const t: T = req.body;
    const newT = resource.add(t);
    return res.status(201).json(newT);
  });
  app.delete("/", (req, res) => {
    const ids: string[] = req.body;
    console.log('ids: ', ids);
    resource.remove(ids);
    return res.status(204).end();
  });
  return app;
}
