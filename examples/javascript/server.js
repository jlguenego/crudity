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
