// import {
//   AuthInterceptor,
//   IdentityInterceptor,
// } from '@blinddeez/api-core/interceptors';

import * as User from '../User';

export default {

  'POST /general/user': {
    interceptors: [],
    handle: User.create,
  },

  'GET /general/user': {
    interceptors: [],
    handle: User.getAll,
  },

  'GET /general/user/:id': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: User.get,
  },

  'PUT /general/user/:id': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: User.update,
  },

  'DELETE /general/user/:id': {
    interceptors: [
      // AuthInterceptor(),
      // IdentityInterceptor,
    ],
    handle: User.remove,
  },
};
