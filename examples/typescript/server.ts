import express from 'express';
import {createServer} from 'http';
import {AddressInfo} from 'net';
import {crudity, checkDuplicate} from '../../src';

const app = express();
const server = createServer(app);
interface Truc {
  name: string;
  id: string;
}
const articleCrud = crudity<Truc>(server, 'articles', {
  pageSize: 100,
  hateoas: 'body',
});

app.use(express.json());

app.post('/api/articles', checkDuplicate<Truc>(articleCrud, 'name'));
app.use('/api/articles', articleCrud);
server.listen(3333, () => {
  console.log(
    `server started on port ${(server.address() as AddressInfo).port}`
  );
});
