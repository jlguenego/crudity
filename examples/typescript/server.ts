import express from 'express';
import {createServer} from 'http';
import {AddressInfo} from 'net';
import {crudity} from '../../src';

const app = express();
const server = createServer(app);
const articleCrud = crudity<{name: string; id: string}>(server, 'articles', {
  pageSize: 100,
  hateoas: 'body',
});

app.use(express.json());

app.post('/api/articles', (req, res, next) => {
  (async () => {
    try {
      const article = req.body;
      const result = await articleCrud.service.get({
        filter: {name: article.name},
      });
      if (result.array.length > 0) {
        res.status(400).send(`duplicate name : ${article.name}`);
        return;
      }
      next();
    } catch (err) {
      res.status(500).end();
    }
  })();
});
app.use('/api/articles', articleCrud);
server.listen(3333, () => {
  console.log(
    `server started on port ${(server.address() as AddressInfo).port}`
  );
});
