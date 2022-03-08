'use strict'
import {Connection} from './connection';

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
      throw new Error('Invalid server response.');
    }
    this.recieveMessage(await result.text());
  }
}
