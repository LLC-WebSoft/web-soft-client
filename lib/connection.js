'use strict'
import { validator } from './validator';
import {ERRORS, ConnectionError} from './error';

const JSONRPCReponseSchema = {
  required: ['jsonrpc'],
  properties: {
    jsonrpc: {
      type: 'string',
      pattern: '2.0'
    },
    result: {
      type: 'object'
    },
    id: {
      type: ['number', 'null']
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

export class Connection extends EventTarget {
  constructor() {
    super();
    this.callId = 0;
    this.requests = new Map();
    this.onEvent = () => {};
  }

  async call(method = '', params = {}) {
    try {
      const data = { jsonrpc: '2.0', method, params, id: this.callId };
      const promise = new Promise((resolve, reject) => {
        this.requests.set(this.callId, { resolve, reject });
      });
      this.callId++;
      await this.request(data);
      return promise;
    } catch (error) {
      if (!error instanceof ConnectionError) {
        throw new ConnectionError({...ERRORS.INTERNAL_API_ERROR, internal: error});
      } else {
        throw error;
      }
    }
  }

  async recieveMessage(data) {
    try {
      const message = this.parseJSON(data);
      if ( message && typeof message.id === 'number' ) {
        this.resolveOne(this.getRPCResult(message), message.id);
      } else if ( message ) {
        const { event = '', data = {} } = this.getRPCResult(message);
        this.onEvent(event, data);
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
      console.log(validateMessage.errors);
      throw new ConnectionError({...ERRORS.INVALID_SERVER_RESPONSE, internal: message}, message.id);
    }
    if (message.error) {
      throw new ConnectionError({...message.error}, message.id);
    }

    return message.result;
  }

  rejectAll(error) {
    for (const request of this.requests) {
      request[1].reject(error);
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
      throw new ConnectionError({...ERRORS.INVALID_SERVER_RESPONSE, internal: data});
    }
  }
}
