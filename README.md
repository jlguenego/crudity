# Crudity

Test server implementing a standard CRUD API with a database json file.

## Install

```
npm i crudity
```

## Usage

Typescript

```
import express from "express";
import path from "path";
import { Crudity } from "crudity";
import { Article } from "../misc/Article";

const app = express();
const www = ".";
const filename = path.resolve(__dirname, "../data/test.json");
const articleRouter = new Crudity<Article>({ filename }).router;

app.use(express.json());
app.use("/ws/articles", articleRouter);

app.listen(3000, () => console.log("Server started on port 3000"));
```

## Middleware options

The middleware `crudity(options: CrudityOptions)` has following options:

- `filename`: path of the database json file. Mandatory.
- `minify`: Minify the JSON before storing. `false` by default.
- `debounceTimeDelay`: Do not write in the file less than this delay. `2000` by default.
- `pageSize`: default page size for _retrieve all_ requests. `20` by default.

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

Retrieve all. Pagination applies.

```
GET /ws/articles HTTP/1.1
```

Retrieve the third page with default page size.

```
GET /ws/articles?page=3 HTTP/1.1
```

Retrieve the second page, with 50 items per page, reverse order by name and filter by the first address city which must start by 'A' or 'a' (case insensitive).

```
GET /ws/articles?page=2&pageSize=50&orderBy=-name&filter[addresses][0][city]=/a.*/i HTTP/1.1
```

The query string uses the [`qs` node module format](https://github.com/ljharb/qs), integrated withing express.
Crudity query options are:

- `page`: page index starting at 1. Default is `1`.
- `pageSize`: number of items per page. Default is `20`.
- `orderBy`: order by field name.
  - It is a string for one field only, or an array if many fields are to be ordered.
  - Each field can be reversed by prefixing it with `-`. `+` is also a optional prefix for ascending.
- `filter`: filter on field name given a javascript regex to be matched or simply a string to be equal to. The filter key must be an object with the same interface as the resource. The value are the regex or string wanted on the fields.

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
