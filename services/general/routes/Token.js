import * as Token from '../Token';

export default {

  // Token
  'POST /auth/login': {
    interceptors: [],
    handle: Token.login,
  },

  // Token
  'POST /auth/refresh': {
    interceptors: [],
    handle: Token.refresh,
  },

};
