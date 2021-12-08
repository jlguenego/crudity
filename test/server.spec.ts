import assert from 'assert';
import fs from 'fs';
import got from 'got';
import {WebServer} from '../src/WebServer';
import {oneHundredArticles, a1, a2} from './fixtures/articles';
import {Article} from './misc/Article';

const port = +(process.env.TEST_PORT || 3333);

describe('Server', () => {
  const webServer = new WebServer({
    port,
    resources: {
      articles: {
        enableLogs: false,
        storage:
          process.env.TEST_STORAGE === 'mongo'
            ? {
                type: 'mongodb',
                uri: 'mongodb://localhost/crudity-unit-test',
              }
            : {
                type: 'file',
                dataDir: './data/test',
              },
        validators: [{name: 'unique', args: ['name']}],
      },
    },
    enableLogs: false,
  });
  before(async () => {
    await webServer.start();
  });

  after(async () => {
    await webServer.stop();
  });

  const testStorage = process.env.TEST_STORAGE === 'mongo' ? 'mongo' : 'file';

  it(`should test with ${testStorage}`, () => {});

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
      .json<Article[]>();
    assert.deepStrictEqual(articles, []);
  });

  it('should add 100 articles in bulk', async () => {
    const newArticles = await got
      .post(`http://localhost:${port}/api/articles`, {
        body: JSON.stringify(oneHundredArticles),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json<Article[]>();
    assert.deepStrictEqual(newArticles.length, 100);
    const articles = await got
      .get(`http://localhost:${port}/api/articles?pageSize=200`)
      .json<Article[]>();
    assert.deepStrictEqual(articles.length, 100);
  });

  it('should add 1 article', async () => {
    const newArticles = await got
      .post(`http://localhost:${port}/api/articles`, {
        body: JSON.stringify(a1),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json<Article>();
    assert.deepStrictEqual(newArticles.price, a1.price);
    const articles = await got
      .get(`http://localhost:${port}/api/articles?pageSize=200`)
      .json<Article[]>();
    assert.deepStrictEqual(articles.length, 101);
  });

  it('should patch 1 article', async () => {
    const articles = await got
      .get(`http://localhost:${port}/api/articles?filter[name]=${a1.name}`)
      .json<Article[]>();
    const article = articles[0];
    assert.deepStrictEqual(article.price, a1.price);
    const newPrice = 34.56;
    const patchedArticle = await got
      .patch(`http://localhost:${port}/api/articles/${article.id}`, {
        body: JSON.stringify({price: newPrice}),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json<Article>();
    assert.deepStrictEqual(patchedArticle.price, newPrice);
  });

  it('should rewrite 1 article', async () => {
    const articles = await got
      .get(`http://localhost:${port}/api/articles?filter[name]=${a1.name}`)
      .json<Article[]>();
    const article = articles[0];
    assert.deepStrictEqual(article.name, a1.name);

    const rewroteArticle = await got
      .put(`http://localhost:${port}/api/articles/${article.id}`, {
        body: JSON.stringify(a2),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .json<Article>();
    assert.deepStrictEqual(rewroteArticle.name, a2.name);
  });
});
