'use strict'
import { validator } from './lib/validator';

const JSONRPCReponseSchema = {
  required: ['jsonrpc', 'method'],
  properties: {
    jsonrpc: {
      type: 'string',
      pattern: '2.0'
    },
    result: {
      type: 'object'
    },
    id: {
      type: 'number'
    },
    error: {
      type: 'object',
      required: ['code', 'message'],
      properties: {
        code: {
          type: 'number'
        },
        message: {
          type: 'string'
        },
        data: {
          type: 'object'
        }
      }
    }
  }
};

const validateMessage = validator.compile(JSONRPCReponseSchema);

class ConnectionError extends Error {
  constructor({message, code, data}, id = null) {
    super(message);
    this.id = id;
    this.code = code;
    this.data = data;
  }
}

export class Connection {
  constructor() {
    this.callId = 0;
    this.requests = new Map();
  }

  async call(method = '', params = {}) {
    const data = { jsonrpc: '2.0', method, params, id: this.callId };
    this.callId++;
    await this.request(data);
    return new Promise((resolve, reject) => {
      this.requests.set(this.callId, { resolve, reject });
    });
  }

  async recieveMessage(data) {
    try {
      const message = this.parseJSON(data);
      if ( message && message.id ) {
        this.resolveOne(this.getRPCResult(message), message.id);
      }
    } catch (error) {
      if (error.id) {
        this.rejectOne(error, error.id);
      } else {
        this.rejectAll(error);
      }
    }
  }

  getRPCResult (message) {
    if (!validateMessage(message)) {
      throw new ConnectionError({message: 'Invalid server response.'}, message.id);
    }
    if (message.error) {
      throw new ConnectionError(message.error, id);
    }
    return message.result;
  }

  rejectAll(error) {
    for (const request of this.requests) {
      request.reject(error);
    }
    this.requests.clear();
  }

  resolveOne(result, id) {
    const request = this.requests.get(id);
    if (request) request.resolve(result);
    this.requests.delete(id);
  }

  rejectOne(error, id) {
    const request = this.requests.get(id);
    if (request) request.reject(error);
    this.requests.delete(id);
  }

  parseJSON(data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Server return invalid JSON.');
    }
  }
}
