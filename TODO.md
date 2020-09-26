# TODO

- Refactor crudity to be a router that is not a class.
  - Purpose of the router is just to expose the CRUD of a class resource.
  - The router can takes options, resource class included.
  - The router can takes validation options. The router included validation stuff.
  - validation must be handled for:
    - POST (create bulk and create one)
    - DELETE (validate id list)
    - PUT (put bulk and put one)
    - PATCH (patch bulk and patch one)
- Review the test case
  - when tests are finished, test.json must include 100 items.
  - tests should not rely on file but on data in RAM.
- implement hateoas for GET all and GET one (next and previous, first and last)
- queryString: transform page into since (like github API)
- resource integrated with mongodb/sequelize
- sanitizer

