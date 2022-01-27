// import {
//   AuthInterceptor,
//   IdentityInterceptor,
// } from '@blinddeez/api-core/interceptors';

import * as Random from '../Random';

export default {

  'POST /general/random/:musicLabel': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Random.create,
  },

  'GET /general/random/:musicLabel': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Random.get,
  },

  'PATCH /general/random/:musicLabel': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: Random.edit,
  },

};
