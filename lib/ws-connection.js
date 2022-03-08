'use strict'
import {Connection} from './connection';

export class WSConnection extends Connection {
  constructor(host, secure = false) {
    super();
    this.host = host;
    this.secure = secure;
    this.opened = false;
    this.queue = [];
    this.url = `ws${this.secure ? 's' : ''}://${this.host}`;
    this.client = new WebSocket(this.url);
    this.client.onopen = this.onopen.bind(this);
    this.client.onmessage = this.onmessage.bind(this);
  }

  onopen() {
    this.opened = true;
    for (const data of this.queue) {
      this.request(data);
    }
  }

  onmessage(event) {
    this.recieveMessage(event.data);
  }

  request(data) {
    if (!this.opened) {
      this.queue.push(data);
    } else {
      this.client.send(JSON.stringify(data));
    }
  }
}
