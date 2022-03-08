import Ajv from 'ajv';
const ajv = new Ajv();

class Validator {
  compile(schema) {
    return ajv.compile({
      type: 'object',
      additionalProperties: false,
      ...schema
    });
  }
}

export const validator = new Validator();
