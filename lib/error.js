'use strict';
export const ERRORS = {
  INTERNAL_API_ERROR: {
    code: -50501,
    message: 'Internal client api error.'
  },
  INVALID_SERVER_RESPONSE: {
    code: -50600,
    message: 'Invalid server response.'
  }
};

export class ConnectionError extends Error {
  constructor({message, code, data, internal}, id = null) {
    super(message);
    this.id = id;
    this.code = code;
    this.data = data;
    this.internal = internal;
  }
}
