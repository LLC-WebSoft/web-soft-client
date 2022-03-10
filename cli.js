#!/usr/bin/env node
const parseOptions = require('parse-options');
const http = require('http');
const path = require('path');
const fs = require('fs');

const WORKING_DIRECTORY = process.cwd();
const apiTemplate = `import { Api } from 'web-soft-client';

/**
 * @type {import('./api-types').API}
 */
export let api = {};

export const loadApi = async () => {
  const loadedApi = new Api(config);
  await loadedApi.build();
  api = loadedApi;
};`;

const requestIntrospectionData = JSON.stringify({
  jsonrpc: '2.0',
  method: 'introspection/getModules',
  id: 0
});

const request = (data, hostname, port) =>
  new Promise((resolve, reject) => {
    const request = http.request(
      {
        hostname,
        port,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      },
      (response) => {
        response.on('data', (data) => {
          resolve(JSON.parse(data));
        });
      }
    );
    request.on('error', (error) => {
      reject(error);
    });
    request.write(data);
    request.end();
  });

const getFieldsTypes = (fields = {}) => {
  const { properties = {}, required = [] } = fields;
  let result = '';
  for (const field in properties) {
    const name = `* - \`${field}\` `;
    const type = `{ *${properties[field].type}* } `;
    const description = properties[field].description ? `- ${properties[field].description} ` : '';
    const requiredFlag = required.includes(field) ? '**Required** ' : '';
    result += `${name}${type}${description}${requiredFlag}\n`;
  }
  return result;
};

const getMethodTypes = (methodName, method) => {
  const name = `*@property {function} ${methodName}\n`;
  const description = `***${method.description || ''}**\n`;
  const params = `*___\n* Params:\n${getFieldsTypes(method.params)}\n`;
  const returns = `*___\n* Returns:\n${getFieldsTypes(method.result)}\n`;
  return `${name}${description}${params}${returns}`;
};

const getModuleTypes = (moduleName, module) => {
  const schema = module.schema;
  let result = `/**\n*@typedef {object} ${moduleName};\n`;
  for (const methodName in schema) {
    result += getMethodTypes(methodName, schema[methodName]);
  }
  return `${result}*/\n`;
};

const generateTypes = (modules = {}) => {
  let apiDocs = 'export {};\n/**\n*@typedef {object} API\n';
  let modulesDocs = '';
  for (const moduleName in modules) {
    apiDocs += `*@property {${moduleName}} ${moduleName}\n`;
    modulesDocs += getModuleTypes(moduleName, modules[moduleName]);
  }
  return `${apiDocs}*/\n${modulesDocs}`;
};

(async () => {
  const options = parseOptions('command $path $host|h #port|p', process.argv);
  if (!options.command || !options.path) {
    throw new Error('Command and path cli options required.');
  }

  if (options.command === 'api') {
    fs.writeFileSync(path.resolve(WORKING_DIRECTORY, options.path, 'api.js'), apiTemplate);
  } else if (options.command === 'types') {
    if (!options.host || !options.port) throw new Error('Host and port option required for "types" command.');
    const modules = (await request(requestIntrospectionData, options.host, options.port))?.result?.modules;
    fs.writeFileSync(path.resolve(WORKING_DIRECTORY, options.path, 'api-types.js'), generateTypes(modules));
  }
})();
