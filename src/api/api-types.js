export {};
/**
*@typedef {object} API
*@property {introspection} introspection
*@property {example} example
*@property {auth} auth
*/
/**
*@typedef {object} introspection;
*@property {function} getModules
***Return server api schema.**
*___
* Returns: Object with api schema.

*@property {function} getErrors
***Return error dictionary from server.**
*___
* Returns: Dictionary of server possible errors.

*/
/**
*@typedef {object} example;
*@property {function} method
***Test method for example.**
*___
* Params: Params for test method.
* - `param1` { *number* } - Param1 is number. **Required** 

*___
* Returns: Value that server must return.
* - `message` { *string* } 

*/
/**
*@typedef {object} auth;
*@property {function} register
***Регистрация нового пользователя с ролью user.**
*___
* Params: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `password` { *string* } - Пароль. **Required** 

*___
* Returns: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `role` { *string* } - Роль пользователя. **Required** 
* - `createdTime` { *string* } - Временная метка создания пользователя. **Required** 

*@property {function} login
***Аутентификация пользователя.**
*___
* Params: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `password` { *string* } - Пароль. **Required** 

*___
* Returns: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `role` { *string* } - Роль пользователя. **Required** 
* - `createdTime` { *string* } - Временная метка создания пользователя. **Required** 

*@property {function} logout
***Выход пользователя из системы.**
*@property {function} me
***Получение данных о текущем пользователе.**
*___
* Returns: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `role` { *string* } - Роль пользователя. **Required** 
* - `createdTime` { *string* } - Временная метка создания пользователя. **Required** 

*@property {function} changePassword
***Смена пароля текущего пользователя.**
*___
* Params: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `oldPassword` { *string* } - Старый пароль. **Required** 
* - `newPassword` { *string* } - Новый пароль. **Required** 

*___
* Returns: 
* - `username` { *string* } - Имя пользователя. **Required** 
* - `role` { *string* } - Роль пользователя. **Required** 
* - `createdTime` { *string* } - Временная метка создания пользователя. **Required** 

*/
