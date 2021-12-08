import express from 'express';
import {createServer} from 'http';
import {AddressInfo} from 'net';
import {crudity, checkDuplicate} from '../../src';

interface Truc {
  name: string;
  id: string;
}

const app = express();
const server = createServer(app);

const articleCrud = crudity<Truc>(server, 'articles', {
  pageSize: 100,
  hateoas: 'body',
});

app.use(
  '/api/articles',
  express.json(),
  checkDuplicate<Truc>(articleCrud, 'name')
);
app.use('/api/articles', articleCrud);
server.listen(3333, () => {
  console.log(
    `server started on port ${(server.address() as AddressInfo).port}`
  );
});
