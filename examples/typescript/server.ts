import express from 'express';
import {createServer} from 'http';
import {AddressInfo} from 'net';
import {crudity} from '../../src';

interface Truc {
  name: string;
  id: string;
}

const app = express();
const server = createServer(app);

app.use(
  '/api/articles',
  crudity<Truc>(server, 'articles', {
    pageSize: 100,
    hateoas: 'body',
    validators: [
      {
        name: 'unique',
        args: ['name'],
      },
    ],
  })
);
server.listen(3333, () => {
  console.log(
    `server started on port ${(server.address() as AddressInfo).port}`
  );
});
