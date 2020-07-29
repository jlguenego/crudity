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
import crudity from "crudity";
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

## Middleware options

The middleware `crudity(options: CrudityOptions)` has following options:

- `filename`: path of the database json file. Mandatory.
- `minimized`: Minimize the JSON before storing. `false` by default. 
- `debounceTimeDelay`: Do not write in the file less than this delay. `2000` by default.

## Play

### Create

Create one

```
POST /ws/articles HTTP/1.1
Content-Type: application/json

{"name":"Screwdriver","price": 2.99,"qty":100}
```

Create bulk

```
POST /ws/articles HTTP/1.1
Content-Type: application/json

[{"name":"Screwdriver","price": 2.99,"qty":100},{"name":"Hammer","price": 1.50,"qty":80}]
```

### Retrieve

Retrieve all.

```
GET /ws/articles HTTP/1.1
```

Retrieve with default pagination.

```
GET /ws/articles?page(3) HTTP/1.1
```

Retrieve with 50 item pagination, reverse order by name and filter by the first address city which must start by 'A' or 'a'.

```
GET /ws/articles?page(2, 50)&orderDesc(name)&filter(addresses[0].city, /a.*/i) HTTP/1.1
```

Retrieve one

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

["1234"]
```

Delete All

```
DELETE /ws/articles HTTP/1.1
```

## HATEOAS

In the HTTP request header you can set the key `X-Crudity-Hateoas: <value>`. The possible values are:

- `X-Crudity-Hateoas: none`: No Hateoas info produced (default).
- `X-Crudity-Hateoas: header`: Hateoas info produced under the HTTP response header `X-Crudity-Link` in a JSON format: .
- `X-Crudity-Hateoas: body`: Hateoas info produced under the body response in a JSON format. Warning, the result of the request will be under the `result` key.

Example of request with HATEOAS in the body:

```
GET /ws/articles/1234 HTTP/1.1
X-Crudity-Hateoas: body
```

Response:

```
HTTP/1.1 200 OK
Content-Type: application/json
...

{"result": {"id":1234, "name": "Pliers", "price": 1.50, "qty": 300},
"links": ["next": "/ws/articles/1235", "previous": "/ws/articles/1233"]}
```

## Author

Jean-Louis GUENEGO <jlguenego@gmail.com>
