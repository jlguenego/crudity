# Crudity

Test server implementing a standard REST CRUD API.

By default the server stores the resource in a JSON file.

## Install

```
npm i crudity
```

## Usage

### Javascript

```js
const express = require("express");
const { crudity } = require("crudity");

const app = express();
app.use("/ws/articles", crudity());

app.listen(3000, () => console.log("JS Server started on port 3000"));
```

### Typescript

```ts
import express from "express";
import { Crudity } from "crudity";

interface Article {
  id?: string;
  name: string;
  price: number;
  qty: number;
}

const app = express();
app.use("/ws/articles", crudity<Article>());

app.listen(3000, () => console.log("Server started on port 3000"));
```

## Middleware options

The middleware `crudity(options: CrudityOptions)` has following options:

- `pageSize: number` - default page size for _retrieve all_ requests. `20` by default.
- `validator?: Validator` - optional. If provided, validate and sanatize the request body.
  You need to subclass the [Validator class](./src/Validator.ts).
- `resource?: Resource` - optional. If provided the [Resource class](./src/Resource.ts) to be used.
  It is a subclass of Resource.
  It is by default `new JsonResource()`.

The `JsonResource` class takes the following options:

- `filename: string` - path of the database json file. By default it is `crudity.json` in the user directory.
- `minify: boolean` - Minify the JSON before storing. `false` by default.
- `debounceTimeDelay: number` - Do not write in the file less than this delay. `2000` by default.

### Example

```ts
crudity<Article>({
  validator: new DTOValidator(Article),
  resource: new JsonResource({
    filename: path.resolve(__dirname, "./articles.json"),
    minify: true,
  }),
});
```

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

Retrieve the second page, with 50 items per page, reverse order by name,
and then ordered by price ascending, finally filter by the first address city which must start by 'A' or 'a' (case insensitive).

```
GET /ws/articles?page=2&pageSize=50&orderBy=-name,+price&filter[addresses][0][city]=/a.*/i HTTP/1.1
```

The query string uses the [`qs` node module format](https://github.com/ljharb/qs), integrated withing express.
Crudity query options are:

- `page`: page index starting at 1. Default is `1`.
- `pageSize`: number of items per page. Default is `20`.
- `orderBy`: order by field name.
  - It is a concatenated string of fields that are to be ordered,
    separated by a comma character `,`.
  - Each field can be reversed by prefixing it with `-`.
    `+` is also a optional prefix for ascending.
- `filter`: filter on field name given a javascript regex to be matched or simply a string to be equal to. The filter key must be an object with the same interface as the resource. The value are the regex or string wanted on the fields.
- `select`: list of fields to be returned, comma separated. `*` to return all. Default is `*`.
- `unselect`: list of fields to not be returned, comma separated. Default is empty.

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

## Thanks

Thanks to some url that helped me.

- https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/

## Author

Jean-Louis GUENEGO <jlguenego@gmail.com>
