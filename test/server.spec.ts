import {Person} from './misc/Person';
import assert from 'assert';

describe('Server', () => {
  it('should test', () => {
    const alice = new Person();
    alice.sayHello();
    assert(true);
  });
});
