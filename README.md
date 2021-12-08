# Crudity

A production ready CRUD backend server and node http middleware, working with files/mongodb/etc.

## Quick start

Take less than 10 seconds.

```
npx crudity
```

Can be configured with a `crudity.json` file. See [Configuration](#Configuration)

## Install

### Global mode

```
npm i crudity -g
```

### On a local project

```
npm i crudity
```

## Usage

### Command line

```
npx crudity
```

### Javascript

```js
const express = require('express');
const {createServer} = require('http');
const {crudity} = require('../../build/src');

const app = express();
const server = createServer(app);
app.use(
  '/api/articles',
  crudity(server, 'articles', {
    pageSize: 100,
    hateoas: 'body',
  })
);
server.listen(3333, () => {
  console.log(`server started on port ${server.address().port}`);
});
```

### Typescript

```ts
import express from 'express';
import {createServer} from 'http';
import {AddressInfo} from 'net';
import {crudity} from 'crudity';

const app = express();
const server = createServer(app);
app.use(
  '/api/articles',
  crudity(server, 'articles', {
    pageSize: 100,
    hateoas: 'body',
  })
);
server.listen(3333, () => {
  console.log(
    `server started on port ${(server.address() as AddressInfo).port}`
  );
});
```

## Out of scope

This module only focus on CRUD operations. **It does not perform**:

- synchrone validation
- sanitizing (xss, trim, etc.)
- authentication / authorization
- logging (access log, trace)

However, it offers some async validation operators:

- **unique**: avoid duplicate entry on some fields.
- that's it for the time being.

Note that you can write your own async validation operators using the CRUDService `crudityRouter.service`.

You can check these projects:

- Synchrone validation:
  - [superstruct](https://github.com/ianstormtaylor/superstruct)
- Authentication with OAuth2:
  - [@jlguenego/express-oauth2-client](https://www.npmjs.com/package/@jlguenego/express-oauth2-client)
- logging access log
  - [morgan](https://www.npmjs.com/package/morgan)

## Crudity options

The middleware `crudity(server: http.Server, resourceName: string, options: CrudityOptions)` has following options called `CrudityOptions`:

- `pageSize: number` - default page size for _retrieve all_ requests. `20` by default.
- `storage` - an object for specifying how to store the resource (ex: json file storage, mongodb storage). See [Storage options](# Storage options)
- `hateoas`: `body`, `header`, or `none`. Give hateoas informations through the HTTP request body, or the HTTP request header, or do not give hateoas information. Hateoas are kind of interesting related links (ex: next, previous, first, last page).
- `delay`: if you want to add slowness to the request (for debugging purpose)
- `enableLogs`: if you want to see logs.

## Storage options

The storage object always has a `type` that can be:

- `file`
- `mongo`
- other value if implemented.

### File (Json)

- `dataDir`: the directory where to store the json file.

### Mongo

- `uri`: The mongo URI to connect to. See the MongoDB doc how to add options to it.

### Other

You can implement your own storage service.

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

Hateoas information is provided or not, according the 3 following modes:

- **none**: no hateoas is provided.
- **header**: the `Link` header is used (default).
- **body**: the returned body is an object containing two properties:

  - links: contains an array of all related hateoas links.
  - result: contains the normal result of the request.

You can configure in the crudity options the hateoas, but also overwrite the options directly in the request, using the HTTP header as follows:

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

## Configuration

[This $schema file](https://raw.githubusercontent.com/jlguenego/crudity/master/schema/crudity.json) can be used to get automatic completion in some IDE (VSCode, etc.)

Example of `crudity.json` file:

```
{
  "$schema": "https://raw.githubusercontent.com/jlguenego/crudity/master/schema/crudity.json",
  "port": 3500,
  "publicDir": "./public",
  "cors": true,
  "resources": {
    "articles": {
      "pageSize": 10,
      "delay": 500
    },
    "users": {
      "pageSize": 15,
      "storage": {
        "type": "mongodb",
        "uri": "mongodb://localhost/crudity"
      }
    }
  },
  "rootEndPoint": "/api"
}
```

## TODO

- Doc for implementing a new service
- Doc for integrating in express
- Exemple with validation, authentication, sanitizing, etc.

## Thanks

Thanks to some url that helped me.

- https://www.moesif.com/blog/technical/api-design/REST-API-Design-Filtering-Sorting-and-Pagination/

## Participating

Do not hesitate to bring your contribution to this project. Fork and Pull Request are welcome.

## License

ISC

## Author

Jean-Louis GUENEGO <jlguenego@gmail.com>
