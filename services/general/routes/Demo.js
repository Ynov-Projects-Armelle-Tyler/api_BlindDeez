import * as Demo from '../Demo';

export default {

  'GET /general/demo/socket': {
    interceptors: [
      // AuthInterceptor(types),
    ],
    handle: Demo.socket,
  },

  'POST /general/email': {
    interceptors: [
      // AuthInterceptor(types),
    ],
    handle: Demo.send,
  },

};
