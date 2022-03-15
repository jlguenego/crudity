import { Swagger } from "./Swagger";
import express, { Response, Router } from "express";
import { Server } from "http";
import { CrudityConsole } from "./CrudityConsole";
import { CRUDServiceFactory } from "./CRUDService/CRUDServiceFactory";
import { Hateoas } from "./Hateoas";
import { CrudityOptions } from "./interfaces/CrudityOptions";
import { CrudityQueryString } from "./interfaces/CrudityQueryString";
import { CrudityRouter } from "./interfaces/CrudityRouter";
import { Idable } from "./interfaces/Idable";
import { checkQueryString } from "./querystring";
import { ValidatorError } from "./validators/Validator";
import { ValidatorFactory } from "./validators/ValidatorFactory";
import YAML from "yaml";

const defaultOptions: CrudityOptions = {
  pageSize: 15,
  hateoas: "header",
  storage: {
    type: "file",
    dataDir: "./data",
  },
  delay: 0,
  enableLogs: false,
  validators: [],
};

const manageError = (err: unknown, res: Response) => {
  console.error("err: ", err);
  res.status(500).end();
};

export const crudity = <T extends Idable>(
  server: Server,
  resourceName: string,
  opts: Partial<CrudityOptions> = {}
): CrudityRouter<T> => {
  const options = { ...defaultOptions, ...opts };
  const console = new CrudityConsole(options.enableLogs);
  console.log(`crudity options for resource "${resourceName}": `, options);

  const service = CRUDServiceFactory.get<T>(resourceName, options.storage);

  const validators = options.validators.map((validator) => {
    return { ...validator, fn: ValidatorFactory.get(service, validator.name) };
  });

  (async () => {
    try {
      console.log(
        `about to start crudity service for resource ${resourceName}(${options.storage.type})`
      );
      await service.init();
      console.log(
        `crudity service for resource ${resourceName}(${options.storage.type}) started with success.`
      );
    } catch (err) {
      console.log("err: ", err);
      throw err;
    }
  })();

  server.on("close", async () => {
    console.log(
      `about to stop crudity service for resource ${resourceName}(${options.storage.type})`
    );
    await service.finalize();
    console.log(
      `crudity service for resource ${resourceName}(${options.storage.type}) stopped with success.`
    );
  });

  const app = Router() as CrudityRouter<T>;
  app.service = service;

  app.use((req, res, next) => {
    // already started
    if (service.isStarted) {
      next();
      return;
    }
    // not yet started, wait...
    service.once("started", () => {
      next();
    });
  });

  app.use((req, res, next) => {
    console.log("crudity req.url", req.url);
    setTimeout(() => {
      next();
    }, options.delay);
  });

  app.get("/openapi.json", (req, res) => {
    res.json(new Swagger(resourceName, options).generate());
  });

  app.get("/openapi.yml", (req, res) => {
    const yml = YAML.stringify(new Swagger(resourceName, options).generate());
    res.setHeader("content-type", "application/x-yaml");
    res.send(yml);
  });

  app.use(express.json());

  // async validation
  app.use((req, res, next) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method)) {
      next();
      return;
    }
    if (!req.body) {
      next();
      return;
    }
    (async () => {
      try {
        const resources = req.body instanceof Array ? req.body : [req.body];
        for (const resource of resources) {
          for (const validator of validators) {
            try {
              await validator.fn.validate(resource, validator.args);
            } catch (err) {
              if (err instanceof ValidatorError) {
                res.status(400).send(err.message);
                return;
              }
            }
          }
        }
        next();
      } catch (err) {
        res.status(500).end();
      }
    })();
  });

  app.post("/", (req, res) => {
    (async () => {
      try {
        if (req.body instanceof Array) {
          // bulk scenario
          const array: T[] = await service.addMany(req.body as T[]);
          res.status(201).json(array);
          return;
        }
        const t: T = req.body;
        const newT = await service.add(t);
        res.status(201).json(newT);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.get("/", (req, res) => {
    (async () => {
      try {
        const query = req.query as unknown as CrudityQueryString;
        try {
          checkQueryString(query);
        } catch (e) {
          res.status(400).end("queryString not well formatted: " + e);
          return;
        }
        const paginatedResult = await service.get(query, options.pageSize);
        const hateoas = new Hateoas(req, res, paginatedResult, options.hateoas);
        hateoas.json();
        return;
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.get("/:id", (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = await service.getOne(id);
        if (!t) {
          res.status(404).end();
          return;
        }
        res.json(t);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.put("/:id", (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = service.getOne(id);
        if (!t) {
          res.status(404).end();
          return;
        }
        req.body.id = id;
        const newT = await service.rewrite(req.body as T);
        console.log("newT: ", newT);
        res.json(newT);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.patch("/:id", (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        const t = service.getOne(id);
        if (!t) {
          res.status(404).end();
          return;
        }
        const newT = await service.patch(id, req.body);
        res.json(newT);
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.delete("/", (req, res) => {
    (async () => {
      try {
        if (!(req.body instanceof Array)) {
          service.removeAll();
          res.status(204).end();
          return;
        }
        const ids: string[] = req.body;
        service.remove(ids);
        res.status(204).end();
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.delete("/:id", (req, res) => {
    (async () => {
      try {
        const id = req.params.id;
        service.remove([id]);
        res.status(204).end();
        return;
      } catch (err) {
        manageError(err, res);
      }
    })();
  });

  app.use((req, res) => {
    res.status(405).end();
  });

  return app;
};
