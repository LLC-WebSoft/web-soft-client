'use strict';
import { HTTPConnection } from './lib/http-connection';
import { WSConnection } from './lib/ws-connection';

const httpConnection = new HTTPConnection('localhost');
const wsConnection = new WSConnection('localhost');

(async () => {
  const res1 = await httpConnection.call('auth/me');
  const res2 = await wsConnection.call('auth/me');
  console.log(res1, res2);
})();
