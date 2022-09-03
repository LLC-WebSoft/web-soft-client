export interface ApiConfig {
  host: string;
  secure: boolean;
  getModulesMethod: string;
};

export function loadApi(config: ApiConfig) : void;

export interface ErrorMetaData {
  code: number;
  message: string;
  internal?: string;
  data?: any;
}

export class ConnectionError extends Error{
  id?: number;
  code: number;
  data?: object;
  internal?: string;
  constructor(meta: ErrorMetaData, id?: number);
};
