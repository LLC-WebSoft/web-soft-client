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
    this.client.onclose = this.onclose.bind(this);
    this.client.onerror = this.onerror.bind(this);
  }

  transferConnection(connection) {
    connection.queue = this.queue;
    connection.requests = this.requests;
    connection.callId = this.callId;
    this.queue = [];
    this.requests = new Map();
  }

  close() {
    this.opened = false;
    if (this.requests.size === 0) {
      this.client.close();
    }
  }

  onerror(event) {
    this.dispatchEvent(new CustomEvent('connection-error', event));
  }

  onclose() {
    this.opened = false;
    this.dispatchEvent(new CustomEvent('connection-closed'));
  }

  onopen() {
    this.opened = true;
    this.dispatchEvent(new CustomEvent('connection-opened'));
    for (const data of this.queue) {
      this.request(data);
    }
    this.queue = [];
  }

  onmessage(event) {
    this.recieveMessage(event.data);
    if (!this.opened && this.requests.size === 0) {
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
