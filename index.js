'use strict'

class Connection {
  constructor() {
    this.callId = 0;
  }

  async call(method = '', params = {}) {
    const data = {jsonrpc: '2.0', method, params, id: this.callId};
    this.callId++;
    return await this.request(data);
  }
}

const FETCH_OPRIONS = {
  method: 'POST',
  mode: 'cors',
  credentials: 'include',
  cache: 'no-cache',
  redirect: 'follow',
  headers: {
    'Content-Type': 'application/json',
  },
};

class HTTPConnection extends Connection{
  constructor(host, secure = false) {
    super();
    this.host = host;
    this.secure = secure;
    this.url = `http${ this.secure ? 's' : '' }://${this.host}`;
  }

  async request(data) {
    const result = await fetch(this.url, { ...FETCH_OPRIONS, body: JSON.stringify(data)});
    if (result.status !== 200 || result.headers.get('Content-Type') !== 'application/json') {
      throw new Error('Invalid server response.');
    }
    return await result.json();
  }
}

class WSConnection extends Connection{
  constructor(host, secure = false) {
    super();
    this.host = host;
    this.secure = secure;
    this.url = `ws${ this.secure ? 's' : '' }://${this.host}`;
    this.client = new WebSocket(this.url);
  }

  async request(data) {
    this.client.send(JSON.stringify(data));
    return await result.json();
  }
}

const connection = new HTTPConnection('http://localhost');
connection.call('auth/me').then((result) => console.log(result));
