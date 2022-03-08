'use strict'
import {Connection} from './connection';

export class WSConnection extends Connection {
  constructor(host, secure = false) {
    super();
    this.host = host;
    this.secure = secure;
    this.opened = false;
    this.closed = false;
    this.queue = [];
    this.url = `ws${this.secure ? 's' : ''}://${this.host}`;
    this.client = new WebSocket(this.url);
    this.client.onopen = this.onopen.bind(this);
    this.client.onmessage = this.onmessage.bind(this);
  }

  close() {
    this.closed = true;
  }

  onopen() {
    this.opened = true;
    for (const data of this.queue) {
      this.request(data);
    }
  }

  onmessage(event) {
    this.recieveMessage(event.data);
    if (this.closed && this.requests.size() === 0) {
      this.client.close();
    }
  }

  request(data) {
    if (!this.opened) {
      this.queue.push(data);
    } else {
      this.client.send(JSON.stringify(data));
    }
  }
}
