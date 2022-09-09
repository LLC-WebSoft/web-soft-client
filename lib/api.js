'use strict';
import {HTTPConnection} from './http-connection';
import {WSConnection} from './ws-connection';

const defaultConfig = {
  host: 'localhost',
  secure: false,
  getModulesMethod: 'introspection/getModules',
  connectionResetTimeout: 1000,
  serverResponseTimeout: 5000,
  onConnectionError: (event) => {
    console.log(event);
  }
};

export class Api {
  constructor(config) {
    this.config = { ...defaultConfig, ...config };
    this.ws = null;
    this.http = null;
    this.subscriptions = new Map();
    this.schema = {};
  }

  async connect() {
    this.http = new HTTPConnection(this.config.host, this.config.secure);
    return await this.openWSConnection();
  }

  openWSConnection() {
    return new Promise((resolve, reject) => {
      const ws = new WSConnection(this.config.host, this.config.secure);
      if (this.ws && this.ws.queue.length) this.ws.transferConnection(ws);
      this.ws = ws;
      ws.onEvent = this.onEvent.bind(this);
      ws.addEventListener('connection-opened', () => {
        resolve();
      });

      ws.addEventListener('connection-closed', () => {
        reject('Connection closed.');
        setTimeout(() => {this.openWSConnection()}, this.config.connectionResetTimeout);
      });

      ws.addEventListener('connection-error', (event) => {
        reject('Connection error.');
        this.config.onConnectionError(event);
      });
    });
  }

  async subscribe(event, callback) {
    if (!this.subscriptions.has(event)) this.subscriptions.set(event, []);
    const callbacks = this.subscriptions.get(event);
    callbacks.push( callback );
  }

  onEvent( event, data ) {
    const callbacks = this.subscriptions.get(event);
    if (callbacks) {
      for (const callback of callbacks) {
        callback(null, data);
      }
    }
  }

  async build() {
    const modules = await this.http.call(this.config.getModulesMethod);
    if (modules) {
      this.schema = modules;
      for (const moduleName in modules) {
        const methods = modules[moduleName];
        this[moduleName] = {};
        for (const methodName in methods) {
          const transport = methods[methodName].transport || 'ws';
          const handler = this.getHandler(moduleName, methodName, transport);
          this[moduleName][methodName] = handler.bind(this);
        }
      }
    }
  }

  getHandler(moduleName, methodName, transport) {
    const method = `${moduleName}/${methodName}`;
    return (params, callback) => new Promise(async (resolve, reject) => {
      setTimeout(() => {reject(new Error('Server response timeout!'))}, this.config.serverResponseTimeout);
      try {
        const result = await this[transport].call(method, params);
        if (transport === 'http') this.resetWSConnection();
        if (callback) this.subscribe(method, callback);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    })
  }

  resetWSConnection() {
    const ws = this.ws;
    this.flushSubscriptions();
    if (ws && ws.opened) ws.close();
  }

  flushSubscriptions() {
    for (const [event, callbacks] of this.subscriptions) {
      for(const callback of callbacks) {
        callback(new Error('Connection reset.'));
      }
    }
    this.subscriptions.clear();
  }
}

