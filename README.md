# Crudity

Test server implementing a standard CRUD API with a database json file.

## Install

```
npm i crudity
```

## Usage

```
import express from "express";
import path from "path";
import crudity from "..";
import { Article } from "../misc/Article";

const app = express();
const www = ".";
const filename = path.resolve(__dirname, "../data/data.json");

app.use(express.json());
app.use(
  "/ws/articles",
  crudity<Article>({ filename })
);

app.listen(3000, () => console.log("Server started on port 3000"));
```

## Play

### Create

```
POST /ws/articles HTTP/1.1
Content-Type: application/json

{"name":"Screwdriver","price": 2.99,"qty":100}
```

### Retrieve

```
GET /ws/articles HTTP/1.1
```

```
GET /ws/articles/1234 HTTP/1.1
```

### Update

```
PUT /ws/articles/1234 HTTP/1.1
Content-Type: application/json

{"id":"1234","name":"Screwdriver","price": 2.99,"qty":100}
```

```
PATCH /ws/articles/1234 HTTP/1.1
Content-Type: application/json

{"name":"Screwdriver"}
```

```
PATCH /ws/articles HTTP/1.1
Content-Type: application/json

{"qty":"100"}
```

### Delete

Delete Many
```
DELETE /ws/articles HTTP/1.1
Content-Type: application/json

['1234']
```

Delete All

```
DELETE /ws/articles HTTP/1.1
```

## Author

Jean-Louis GUENEGO <jlguenego@gmail.com>
