'use strict';
import { loadApi } from './lib/api';

(async () => {
  const api = await loadApi();
  try {
    console.log(await api.auth.login({ username: 'danil', password: 'danilpassword1' }));
    console.log(await api.auth.me());
    console.log(await api.auth.logout());
    console.log(await api.auth.login({ username: 'danil', password: 'danilpassword1' }));
    console.log(await api.auth.me());
  } catch (error) {
    console.log(error);
  }
})();
