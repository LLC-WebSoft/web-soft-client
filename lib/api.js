'use strict';
import {HTTPConnection} from './http-connection';
import {WSConnection} from './ws-connection';

const defaultConfig = {
  host: 'localhost',
  secure: false,
  getModulesMethod: 'introspection/getModules'
};

export class Api {
  constructor(config) {
    this.config = { ...defaultConfig, ...config };
    this.ws = new WSConnection(this.config.host, this.config.secure);
    this.ws.onEvent = this.onEvent.bind(this);
    this.http = new HTTPConnection(this.config.host, this.config.secure);
    this.subscriptions = new Map();
    this.schema = {};
  }

  async subscribe(event, callback, params) {
    if (!this.subscriptions.has(event)) this.subscriptions.set(event, []);
    const result = await this.ws.call(event, params);
    const callbacks = this.subscriptions.get(event);
    callbacks.push( callback );
    return result;
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
    const {modules} = await this.http.call(this.config.getModulesMethod);
    if (modules) {
      this.schema = modules;
      for (const moduleName in modules) {
        const methods = modules[moduleName].schema;
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
    return async (params) => {
      const result = await this[transport].call(method, params);
      if (transport === 'http') this.resetWSConnection();
      return result;
    };
  }

  resetWSConnection() {
    const ws = this.ws;
    this.ws = new WSConnection(this.config.host, this.config.secure);
    this.ws.onEvent = this.onEvent.bind(this);
    this.flushSubscriptions();
    ws.close();
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

