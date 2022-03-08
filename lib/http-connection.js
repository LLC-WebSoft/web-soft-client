'use strict'
import {Connection} from './connection';
import {ERRORS, ConnectionError} from './error';

const FETCH_OPRIONS = {
  method: 'POST',
  mode: 'cors',
  credentials: 'include',
  cache: 'no-cache',
  redirect: 'follow',
  headers: {
    'Content-Type': 'application/json'
  }
};

export class HTTPConnection extends Connection {
  constructor(host, secure = false) {
    super();
    this.host = host;
    this.secure = secure;
    this.url = `http${this.secure ? 's' : ''}://${this.host}`;
  }

  async request(data) {
    const result = await fetch(this.url, { ...FETCH_OPRIONS, body: JSON.stringify(data) });
    if (result.status !== 200 || result.headers.get('Content-Type') !== 'application/json') {
      throw new ConnectionError({...ERRORS.INVALID_SERVER_RESPONSE, internal: { status: result.status, headers: result.headers }});
    }
    this.recieveMessage(await result.text());
  }
}
