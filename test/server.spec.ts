import assert from 'assert';
import fs from 'fs';
import got from 'got';
import {WebServer} from '../src/WebServer';
import {twoArticles} from './fixtures/articles';
import {Article} from './misc/Article';

const port = +(process.env.TEST_PORT || 3333);

describe('Server', () => {
  const webServer = new WebServer({
    port,
    resources: {
      articles: {
        storage: {
          type: 'mongodb',
          uri: 'mongodb://localhost/crudity-unit-test',
        },
      },
    },
  });
  before(async () => {
    await webServer.start();
  });

  after(async () => {
    await webServer.stop();
  });

  it('should read test.txt', async () => {
    const text = await got.get(`http://localhost:${port}/test.txt`).text();
    const content = await fs.promises.readFile('./public/test.txt', {
      encoding: 'utf-8',
    });
    assert.deepStrictEqual(text, content);
  });

  it('should delete all articles', async () => {
    await got.delete(`http://localhost:${port}/api/articles`);
    const articles = await got
      .get(`http://localhost:${port}/api/articles`)
      .json();
    assert.deepStrictEqual(articles, []);
  });

  it('should add 2 articles in bulk', async () => {
    const newArticles = await got
      .post(`http://localhost:${port}/api/articles`, {
        body: JSON.stringify(twoArticles),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json<Article[]>();
    console.log('newArticles: ', newArticles);
    assert.deepStrictEqual(newArticles.length, 2);
    const articles = await got
      .get(`http://localhost:${port}/api/articles`)
      .json<Article[]>();
    console.log('articles: ', articles);
    assert.deepStrictEqual(articles.length, 2);
  });
});
