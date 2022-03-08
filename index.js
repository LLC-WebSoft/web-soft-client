'use strict';
import { HTTPConnection } from './lib/http-connection';
import { WSConnection } from './lib/ws-connection';

const httpConnection = new HTTPConnection('localhost');
const wsConnection = new WSConnection('localhost');
httpConnection.call('auth/me');
wsConnection.call('auth/me');
