'use strict';
import { api, loadApi } from './api/api';

document.addEventListener('DOMContentLoaded', async () => {
  //Подгружаем API, делать это обязательно, так как изначально api указывает на пустой объект.
  await loadApi({ secure: true });
  try {
    //Обычные запросы.
    const schema = await api.introspection.getModules();
    console.log(schema);
  } catch (error) {
    //В случае возврата ошибки сервером - она будет выброшена исключением.
    console.log(error);
  }
});
