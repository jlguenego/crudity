import fs from 'fs';
import {WebServer} from './../src/WebServer';
import got from 'got';
import assert from 'assert';

const port = +(process.env.TEST_PORT || 3333);

describe('Server', () => {
  it('should start and stop', async () => {
    const webServer = new WebServer({
      port,
    });
    await webServer.start();
    const text = await got.get(`http://localhost:${port}/test.txt`).text();
    const content = await fs.promises.readFile('./public/test.txt', {
      encoding: 'utf-8',
    });
    await webServer.stop();
    assert.deepStrictEqual(text, content);
  });
});
