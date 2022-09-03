import { Api } from '../../index';

/**
 * @type {import('./api-types').API}
 */
export let api = {};

export const loadApi = async (config = {}) => {
  const loadedApi = new Api(config);
  await loadedApi.build();
  api = loadedApi;
};
