import express from 'express';
import {createServer} from 'http';
import {AddressInfo} from 'net';
import {crudity} from '../../src';

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
