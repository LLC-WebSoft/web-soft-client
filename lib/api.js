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
    return async (params, callback) => {
      const result = await this[transport].call(method, params);
      if (transport === 'http') this.resetWSConnection();
      if (callback) this.subscribe(method, callback);
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

